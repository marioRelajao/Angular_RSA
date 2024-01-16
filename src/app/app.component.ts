import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ServerConnectionService } from './server-connection.service';
import { RsaPubKey } from './rsa/RsaPubKey';
import { base64ToBigint, bigintToBase64, textToBigint } from 'bigint-conversion';

interface RequestMsg {
  message?: string;
  encryptedMessage?: string;
}

interface ResponseMsg {
  ciphertext: string;
  decryptedMessage?: string;
  error?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'angular-client';
  serverConnectionService: ServerConnectionService;

  encryptForm: FormGroup;
  decryptForm: FormGroup;
  encryptResponse: any;
  decryptResponse: any;

  constructor(serverConnectionService: ServerConnectionService) {
    this.serverConnectionService = serverConnectionService;

    this.encryptForm = new FormGroup({
      messageToEncrypt: new FormControl('')
    });

    this.decryptForm = new FormGroup({
      encryptedMessage: new FormControl('')
    });
  }

    ngOnInit(): void {
    // Call the getRSA method when the component initializes
    this.getRSA();
  }

  // async encryptMessage() {



  //   const messageToEncrypt = this.encryptForm.value.messageToEncrypt;

  //   const response = await this.serverConnectionService.postJson<RequestMsg, ResponseMsg>('/encrypt', {
  //     message: messageToEncrypt
  //   });

  //   this.encryptResponse = response.error ?? response.ciphertext;
  // }

  // async decryptMessage() {
  //   const encryptedMessage = this.decryptForm.value.encryptedMessage;

  //   const response = await this.serverConnectionService.postJson<RequestMsg, ResponseMsg>('/decrypt', {
  //     encryptedMessage: encryptedMessage
  //   });

  //   this.decryptResponse = response.error ?? response.decryptedMessage;
  // }

  async encryptMessage() {
    const e = this.serverConnectionService.getPublicKey().e
    // console.log('pubkey E:', base64ToBigint(e))
  try {
    // Get the public key from the service
    const pubKey = this.serverConnectionService.getPublicKey();

    if (!pubKey) {
      console.error('Public key not available.');
      return;
    }

    // Create an instance of RsaPubKey
    const rsaPubKey = new RsaPubKey(pubKey.e, pubKey.n);

    // Get the message to encrypt from the form
    const messageToEncrypt = this.encryptForm.value.messageToEncrypt;

    // Encrypt the message using the public key
    const encryptedMessage = rsaPubKey.encrypt(textToBigint(messageToEncrypt));

    // Optionally, you can convert the encrypted message to base64 or any other format
    const encryptedMessageBase64 = bigintToBase64(encryptedMessage) ;
    // const encryptedMessageBase64 = encryptedMessage.toString();
    console.log('LO QUE ENVIO: ', encryptedMessageBase64)
    // Send the encrypted message to the server
    // const response = await this.serverConnectionService.postJson<RequestMsg, ResponseMsg>('/encrypt', {
    //   message: encryptedMessageBase64,
    // });

    const response = await this.serverConnectionService.postJson<RequestMsg, ResponseMsg>('/decrypt', {
      encryptedMessage: encryptedMessageBase64,
    });

    console.log('LO QUE ENVIO: ', response)
    this.encryptResponse = response.error ?? response.ciphertext;
  } catch (error) {
    console.error('Error encrypting message:', error);
  }
}

  async getRSA() {
    try {
      // Make a request to the server to get the RSA key
      const response = await this.serverConnectionService.getJson<any, any>('/getRSA', {});

      // Check if the response contains a public key
      if (response && response.pubKey) {
        // Store the public key in the service
        const e = response.pubKey.e
        // console.log('EEEE:', base64ToBigint(e))
        const n = response.pubKey.n
        const pubKeyFix = new RsaPubKey(base64ToBigint(e), base64ToBigint(n))
        this.serverConnectionService.setPublicKey(pubKeyFix);

        // Log the stored public key (optional)
        console.log('Public key stored in the client:', this.serverConnectionService.getPublicKey());
      } else {
        console.error('Error getting RSA key from the server:', response.error);
      }
    } catch (error) {
      console.error('Error getting RSA key:', error);
    }
  }
}


function TextToBigInt(messageToEncrypt: any): bigint {
  throw new Error('Function not implemented.');
}


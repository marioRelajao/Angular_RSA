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
  signForm: FormGroup;
  encryptResponse: any;
  decryptResponse: any;
  signStatus: any;

  constructor(serverConnectionService: ServerConnectionService) {
    this.serverConnectionService = serverConnectionService;

    this.encryptForm = new FormGroup({
      messageToEncrypt: new FormControl('')
    });

    this.decryptForm = new FormGroup({
      encryptedMessage: new FormControl('')
    });

    this.signForm = new FormGroup({
      signMessage: new FormControl('')
    });
  }

    ngOnInit(): void {
    this.getRSA();
  }

  async encryptMessage() {
    const e = this.serverConnectionService.getPublicKey().e
  try {
    const pubKey = this.serverConnectionService.getPublicKey();

    if (!pubKey) {
      console.error('Public key not available.');
      return;
    }
    const rsaPubKey = new RsaPubKey(pubKey.e, pubKey.n);

    const messageToEncrypt = this.encryptForm.value.messageToEncrypt;

    const encryptedMessage = rsaPubKey.encrypt(textToBigint(messageToEncrypt));

    const encryptedMessageBase64 = bigintToBase64(encryptedMessage) ;
    console.log('LO QUE ENVIO: ', encryptedMessageBase64)


    const response = await this.serverConnectionService.postJson<RequestMsg, ResponseMsg>('/decrypt', {
      encryptedMessage: encryptedMessageBase64,
    });

    console.log('LO QUE RECIBO: ', response)
    this.encryptResponse = response.error ?? response.ciphertext;
  } catch (error) {
    console.error('Error encrypting message:', error);
  }
}

  async getRSA() {
    try {
      const response = await this.serverConnectionService.getJson<any, any>('/getRSA', {});
      if (response && response.pubKey) {
        const e = response.pubKey.e
        const n = response.pubKey.n
        const pubKeyFix = new RsaPubKey(base64ToBigint(e), base64ToBigint(n))
        this.serverConnectionService.setPublicKey(pubKeyFix);
        console.log('Public key stored in the client:', this.serverConnectionService.getPublicKey());
      } else {
        console.error('Error getting RSA key from the server:', response.error);
      }
    } catch (error) {
      console.error('Error getting RSA key:', error);
    }
  }

  async signMessage() {
    try {
      const pubKey = this.serverConnectionService.getPublicKey();
      if (!pubKey) {
        console.error('Public key not available.');
        return;
      }
      const rsaPubKey = new RsaPubKey(pubKey.e, pubKey.n);
      const messageToSign = this.signForm.value.signMessage;
      console.log('FIRMA:', messageToSign)
      const response = await this.serverConnectionService.postJson<RequestMsg, any>('/sign', {
        message: messageToSign,
      });
      console.log(typeof response)
      console.log('lo que recibo en res: ', response)
      const a = base64ToBigint(response.msgFirmado)
      const status2 = pubKey.verify(a)
      console.log('LO QUE RECIBO: ', status2)
      if (status2 == messageToSign){
        this.signStatus = '🤙'
      }
      else{
        this.signStatus = '😞'
      }
    } catch (error) {
      console.error('Error verifaig message:', error);
    }
  }
}


function TextToBigInt(messageToEncrypt: any): bigint {
  throw new Error('Function not implemented.');
}


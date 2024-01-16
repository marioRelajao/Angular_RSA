import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ServerConnectionService } from './server-connection.service';

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

  async encryptMessage() {
    const messageToEncrypt = this.encryptForm.value.messageToEncrypt;

    const response = await this.serverConnectionService.postJson<RequestMsg, ResponseMsg>('/encrypt', {
      message: messageToEncrypt
    });

    this.encryptResponse = response.error ?? response.ciphertext;
  }

  async decryptMessage() {
    const encryptedMessage = this.decryptForm.value.encryptedMessage;

    const response = await this.serverConnectionService.postJson<RequestMsg, ResponseMsg>('/decrypt', {
      encryptedMessage: encryptedMessage
    });

    this.decryptResponse = response.error ?? response.decryptedMessage;
  }

async getRSA() {
  try {
    // Make a request to the server to get the RSA key
    const response = await this.serverConnectionService.getJson<any, any>('/getRSA', {});

    // Check if the response contains a public key
    if (response && response.pubKey) {
      // Store the public key in the service
      this.serverConnectionService.setPublicKey(response.pubKey);

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



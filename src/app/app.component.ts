import { Component } from '@angular/core';
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
export class AppComponent {
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
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ServerConnectionService } from './server-connection.service';
import { generateRSAKeys, RsaKeyPair} from './rsa/genRSA';
import { RsaServiceService } from 'src/services/rsa-service.service';
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
export class AppComponent implements OnInit {
  keypair: any;
  pubKeyPair:any;

  title = 'angular-client';
  serverConnectionService: ServerConnectionService;

  encryptForm: FormGroup;
  decryptForm: FormGroup;
  encryptResponse: any;
  decryptResponse: any;

  constructor(serverConnectionService: ServerConnectionService, private rsaService: RsaServiceService) {
    this.serverConnectionService = serverConnectionService;

    this.encryptForm = new FormGroup({
      messageToEncrypt: new FormControl('')
    });

    this.decryptForm = new FormGroup({
      encryptedMessage: new FormControl('')
    });
  }
//En el init generamos y recogemos las keys del servidor
  async ngOnInit(): Promise<void> {
    await generateRSAKeys(1024).then(data => {
      this.keypair=data;
      console.log(`Keys Generadas: ${this.keypair}`)
    })

    await this.rsaService.getPubKeyServer().subscribe((data: any) => {
      this.pubKeyPair = data;
    })
  }

  async postMensaje() {
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

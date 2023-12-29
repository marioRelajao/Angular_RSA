import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RsaServiceService {
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  constructor(private http:HttpClient) { }

  getPubKeyServer(): any{
    return this.http.get('http://localhost:3000/getRSA');
  }

  sendPubKey(pubKey):any{
    return this.http.post('http://localhost:3000/getRSA',pubKey)
  }

  


}

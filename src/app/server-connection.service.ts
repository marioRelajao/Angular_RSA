import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerConnectionService {
  readonly baseUrl
  constructor() { 
    this.baseUrl = 'http://localhost:3000'
  }

  async getJson<RequestType, ResponseType>(path: string, json: RequestType): Promise<ResponseType> {
    const response = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    })
    return await response.json()
  }

  async postJson<RequestType, ResponseType>(path: string, json: RequestType): Promise<ResponseType> {
    const response = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    })
    return await response.json()
  }
}
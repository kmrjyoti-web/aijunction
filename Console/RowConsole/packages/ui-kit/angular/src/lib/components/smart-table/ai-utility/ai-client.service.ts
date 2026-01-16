import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

@Injectable({ providedIn: 'root' })
export class AiClientService {
  readonly ai: GoogleGenAI;

  constructor() {
    // This safely handles the case where `process` is not defined in the browser.
    // The build environment is expected to provide process.env.API_KEY.
    // If it doesn't, this will result in an empty string, preventing a crash.
    const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : '';
    this.ai = new GoogleGenAI({apiKey: apiKey});
  }
}

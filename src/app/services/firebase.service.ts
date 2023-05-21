import { Injectable } from '@angular/core';

export enum Collections {
  Account = 'Account'
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor() { }

  public mapDocs<T>({ docs }: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (Array.isArray(docs)) {
        resolve(docs.map(doc => doc.data()) as T);
      } else {
        reject(docs);
      }
    });
  }

}

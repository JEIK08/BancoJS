import { Injectable } from '@angular/core';

import { DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';

export enum Collections {
  Account = 'Account'
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor() { }

  public mapDocs<T extends { id: string }>({ docs }: QuerySnapshot<any>): T[] {
    return docs.map(doc => {
      const data = doc.data();
      data.id = doc.id;
      return data;
    });
  }

}

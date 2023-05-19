import { Injectable } from '@angular/core';

import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(private firestore: Firestore) {
    getDocs(
      query(
        collection(this.firestore, 'transactions'),
        where('value', '>', 1000)
      )
    ).then(data => {
      // debugger;
      data.docs.forEach(doc => console.log(doc.data()));
    });
    // collectionData().subscribe((...data) => {
    //   console.log(data);
    // })
  }

}
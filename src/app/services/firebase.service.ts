import { Injectable } from '@angular/core';

import { Firestore, doc, getDoc, getDocs, query, collection, onSnapshot, addDoc, updateDoc } from '@angular/fire/firestore';

export enum Collection {
  Account = 'Account'
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: Firestore) { }

  getCollectionRef(collectionName: Collection) {
    return collection(this.firestore, collectionName);
  }

  getDocumentRef(collectionName: Collection, id: string) {
    return doc(this.firestore, collectionName, id);
  }

  listenCollection(collectionName: Collection, onChange: (data?: any) => void) {
    onSnapshot(this.getCollectionRef(collectionName), snapshot => onChange(snapshot));
  }

  getDocuments<T>(collectionName: Collection, mapFunction: (doc: T) => void): Promise<T[]> {
    return getDocs(query(this.getCollectionRef(collectionName))).then(({ docs }) => new Promise(resolve => {
      resolve(
        docs.map(docRef => {
          const doc: any = docRef.data();
          doc.id = docRef.id;
          mapFunction(doc);
          return doc;
        })
      );
    }));
  }

  getDocument<T>(collectionName: Collection, id: string): Promise<T> {
    return getDoc(this.getDocumentRef(collectionName, id)).then(docRef => new Promise(resolve => {
      const doc: any = docRef.data();
      doc.id = docRef.id;
      resolve(doc);
    }));
  }

  addDocument(collectionName: Collection, data: any) {
    return addDoc(this.getCollectionRef(collectionName), data);
  }

  updateDocument(collectionName: Collection, id: string, data: any) {
    return updateDoc(this.getDocumentRef(collectionName, id), data);
  }

}

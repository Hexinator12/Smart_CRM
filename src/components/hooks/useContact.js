import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const contactsRef = collection(db, 'contacts');

  const getContacts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(contactsRef);
      const contactsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContacts(contactsData);
    } catch (error) {
      console.error("Error fetching contacts: ", error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData) => {
    try {
      const docRef = await addDoc(contactsRef, {
        ...contactData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await getContacts(); // Refresh the list
      return docRef.id;
    } catch (error) {
      console.error("Error adding contact: ", error);
    }
  };

  // Add update and delete methods similarly

  useEffect(() => {
    getContacts();
  }, []);

  return { contacts, loading, addContact, getContacts };
}
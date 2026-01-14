import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';

const CONTACTS_COLLECTION = 'contacts';

export const contactService = {
  // Create a new contact
  async createContact(contactData) {
    try {
      const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), {
        ...contactData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...contactData };
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },

  // Get all contacts
  async getAllContacts() {
    try {
      const q = query(
        collection(db, CONTACTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },

  // Get contacts by company
  async getContactsByCompany(company) {
    try {
      const q = query(
        collection(db, CONTACTS_COLLECTION),
        where('company', '==', company)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching contacts by company:', error);
      throw error;
    }
  },

  // Update a contact
  async updateContact(contactId, updateData) {
    try {
      const contactRef = doc(db, CONTACTS_COLLECTION, contactId);
      await updateDoc(contactRef, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      return { id: contactId, ...updateData };
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },

  // Delete a contact
  async deleteContact(contactId) {
    try {
      const contactRef = doc(db, CONTACTS_COLLECTION, contactId);
      await deleteDoc(contactRef);
      return contactId;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },

  // Search contacts
  async searchContacts(searchTerm) {
    try {
      const querySnapshot = await getDocs(collection(db, CONTACTS_COLLECTION));
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(contact => 
          contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  }
};
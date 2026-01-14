import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ContactCard from './ContactCard';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'contacts'));
        const contactsData = [];
        querySnapshot.forEach((doc) => {
          contactsData.push({ id: doc.id, ...doc.data() });
        });
        setContacts(contactsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching contacts: ", error);
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) return <div>Loading contacts...</div>;

  return (
    <div className="contact-list">
      <h2>Contacts</h2>
      {contacts.length === 0 ? (
        <p>No contacts found</p>
      ) : (
        contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))
      )}
    </div>
  );
};

export default ContactList;
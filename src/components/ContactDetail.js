import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getContact, updatePhoto } from "../api/ContactService"; // ✅ import getContact
import { toast } from "react-toastify"; // ✅ import toast
import "react-toastify/dist/ReactToastify.css";

const ContactDetail = ({ updateContact, updateImage }) => {
  const inputRef = useRef();
  const { id } = useParams();

  const [contact, setContact] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    title: "",
    status: "",
    photoUrl: "",
  });

  const fetchContact = async (id) => {
    try {
      const { data } = await getContact(id);
      setContact(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch contact details.");
    }
  };

  const selectImage = () => inputRef.current.click();

  const handleUpdatePhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("id", id);

      await updateImage(formData);

      setContact((prev) => ({
        ...prev,
        photoUrl: `${prev.photoUrl}?updated_at=${new Date().getTime()}`,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const onChange = (event) => {
    setContact({ ...contact, [event.target.name]: event.target.value });
  };

  const onUpdateContact = async (event) => {
    event.preventDefault();
    await updateContact(contact);
    fetchContact(id);
  };

  useEffect(() => {
    fetchContact(id);
  }, []);

  return (
    <>
      <Link to="/contacts" className="link">
        <i className="bi bi-arrow-left"></i> Back to list
      </Link>

      <div className="profile">
        <div className="profile__details">
          <img src={contact.photoUrl} alt={`Photo of ${contact.name}`} />
          <div className="profile__metadata">
            <p className="profile__name">{contact.name}</p>
            <p className="profile__muted">JPEG, GIF or PNG. Max size 10Mb</p>
            <button className="btn" onClick={selectImage}>
              <i className="bi bi-cloud-upload"></i> Change Photo
            </button>
          </div>
        </div>

        <div className="profile__settings">
          <form onSubmit={onUpdateContact} className="form">
            <div className="user-details">
              {["name", "email", "phone", "address", "title", "status"].map(
                (field) => (
                  <div className="input-box" key={field}>
                    <span className="details">{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                    <input
                      type="text"
                      value={contact[field]}
                      onChange={onChange}
                      name={field}
                      required
                    />
                  </div>
                )
              )}
            </div>

            <div className="form-footer">
              <button type="submit" className="btn">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Hidden input for file */}
      <input
        type="file"
        style={{ display: "none" }}
        ref={inputRef}
        onChange={(e) => handleUpdatePhoto(e.target.files[0])}
        accept="image/*"
      />
    </>
  );
};

export default ContactDetail;

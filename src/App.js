import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import Header from "./components/Header";
import ContactList from "./components/ContactList";
import ContactDetail from "./components/ContactDetail";
import { getContacts, saveContact, updatePhoto } from "./api/ContactService";

function App() {
  const modalRef = useRef();
  const fileRef = useRef();

  const [data, setData] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [file, setFile] = useState(undefined);
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    title: "",
    status: "",
  });

  const getAllContacts = async (page = 0, size = 10) => {
    try {
      setCurrentPage(page);
      const { data } = await getContacts(page, size);
      setData(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch contacts. Please try again.");
    }
  };

  const onChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleNewContact = async (event) => {
    event.preventDefault();
    try {
      const { data } = await saveContact(values);

      if (file) {
        const formData = new FormData();
        formData.append("file", file, file.name);
        formData.append("id", data.id);
        await updatePhoto(formData);
      }

      toast.success("Contact added successfully!");

      toggleModal(false);
      setFile(undefined);
      fileRef.current.value = null;
      setValues({
        name: "",
        email: "",
        phone: "",
        address: "",
        title: "",
        status: "",
      });

      getAllContacts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add contact. Please try again.");
    }
  };

  const updateContact = async (contact) => {
    try {
      const { data } = await saveContact(contact);
      toast.success("Contact updated successfully!");
      return data;
    } catch (error) {
      console.error(error);
      toast.error("Failed to update contact. Please try again.");
    }
  };

  const updateImage = async (formData) => {
    try {
      await updatePhoto(formData);
      toast.success("Photo updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update photo. Please try again.");
    }
  };

  const toggleModal = (show) =>
    show ? modalRef.current.showModal() : modalRef.current.close();

  useEffect(() => {
    getAllContacts();
  }, []);

  return (
    <>
      <Header toggleModal={toggleModal} nbOfContacts={data.totalElements} />

      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/contacts" />} />
            <Route
              path="/contacts"
              element={
                <ContactList
                  data={data}
                  currentPage={currentPage}
                  getAllContacts={getAllContacts}
                />
              }
            />
            <Route
              path="/contacts/:id"
              element={
                <ContactDetail
                  updateContact={updateContact}
                  updateImage={updateImage}
                />
              }
            />
          </Routes>
        </div>
      </main>

      {/* Modal for new contact */}
      <dialog ref={modalRef} className="modal" id="modal">
        <div className="modal__header">
          <h3>New Contact</h3>
          <i onClick={() => toggleModal(false)} className="bi bi-x-lg"></i>
        </div>

        <div className="divider"></div>

        <div className="modal__body">
          <form onSubmit={handleNewContact}>
            <div className="user-details">
              {["name", "email", "title", "phone", "address", "status"].map(
                (field) => (
                  <div className="input-box" key={field}>
                    <span className="details">{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                    <input
                      type="text"
                      value={values[field]}
                      onChange={onChange}
                      name={field}
                      required
                    />
                  </div>
                )
              )}

              <div className="input-box">
                <span className="details">Photo</span>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  ref={fileRef}
                  name="photo"
                />
              </div>
            </div>

            <div className="form_footer">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => toggleModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn">
                Save
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;

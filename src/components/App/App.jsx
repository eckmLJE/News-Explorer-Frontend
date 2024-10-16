import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import "./App.css";

import Main from "../Main/Main";
import Footer from "../Footer/Footer";
import SavedNews from "../SavedNews/SavedNews";
import LoginModal from "../LoginModal/LoginModal";
import RegisterModal from "../RegisterModal/RegisterModal";
import { CurrentUserContext } from "../../contexts/CurrentUserContext";

import { authorize, checkToken } from "../../utils/auth";
import { getToken, setToken, removeToken } from "../../utils/token";
import { stubbedSavedNewsList } from "../../utils/stubSavedNewsList";

function App() {
  const [currentUser, setCurrentUser] = useState({
    loggedIn: false,
    email: "",
    password: "",
    username: "",
    savedNews: stubbedSavedNewsList,
  });
  const [activeModal, setActiveModal] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  const userContext = {
    currentUser,
    setCurrentUser,
  };

  const handleLoginClick = () => {
    setActiveModal("login");
  };

  const closeActiveModal = () => {
    setActiveModal("");
  };

  const handleRegistration = (values, resetRegistrationForm) => {
    if (!values) return;

    authorize(values)
      .then((res) => {
        setIsLoggedIn(true);
        setCurrentUser(res.data);
        resetRegistrationForm();
        closeActiveModal();
      })
      .catch((res) => {
        console.log(`There is an error in handleUserRegistration: ${res}`);
      });
  };

  const handleLogin = (values, resetLoginForm) => {
    if (!values) {
      return;
    }

    authorize(values)
      .then((res) => {
        setToken(res.token);
        return checkToken(res.token);
      })
      .then((user) => {
        // setCurrentUser(user);
        setIsLoggedIn(true);
        closeActiveModal();
        resetLoginForm();
      })
      .catch((err) => {
        console.error("Login failed", err);
      });
  };

  const handleLogout = () => {
    console.log("logout buton was clicked!");
    localStorage.removeItem("jwt");
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate("/");
  };

  const handleHamburgerClick = () => {
    console.log("this is the nav menu for mobile screen size");
  };

  useEffect(() => {
    if (!activeModal) return;

    const handleEscClose = (e) => {
      if (e.key === "Escape") {
        closeActiveModal();
      }
    };

    document.addEventListener("keydown", handleEscClose);

    return () => {
      document.removeEventListener("keydown", handleEscClose);
    };
  }, [activeModal]);

  return (
    <div className="app">
      <CurrentUserContext.Provider value={userContext}>
        <div className="app__content">
          <Routes>
            <Route
              path="/"
              element={
                <Main
                  handleHamburgerClick={handleHamburgerClick}
                  handleLoginClick={handleLoginClick}
                  isLoggedIn={isLoggedIn}
                  handleLogout={handleLogout}
                />
              }
            ></Route>
            <Route
              path="/saved-news"
              element={
                <SavedNews
                  handleHamburgerClick={handleHamburgerClick}
                  isLoggedIn={isLoggedIn}
                  currentUser={currentUser}
                  handleLogout={handleLogout}
                />
              }
            ></Route>
          </Routes>
          <Footer />
          <LoginModal
            isOpen={activeModal === "login"}
            onClose={closeActiveModal}
            setActiveModal={setActiveModal}
            handleLogin={handleLogin}
          />
          <RegisterModal
            isOpen={activeModal === "register"}
            onClose={closeActiveModal}
            setActiveModal={setActiveModal}
            handleRegistration={handleRegistration}
          />
        </div>
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;

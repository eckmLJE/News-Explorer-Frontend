import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import "./App.css";

import Main from "../Main/Main";
import Footer from "../Footer/Footer";
import SavedNews from "../SavedNews/SavedNews";
import LoginModal from "../LoginModal/LoginModal";
import RegisterModal from "../RegisterModal/RegisterModal";
import SuccessModal from "../SuccessModal/SuccessModal";
import { CurrentUserContext } from "../../contexts/CurrentUserContext";
import { getUserByToken, signinUser, registerUser } from "../../utils/auth";
import { getToken, setToken, removeToken } from "../../utils/token";
import { stubbedSavedNewsList } from "../../utils/stubSavedNewsList";
import { getNews } from "../../utils/newsapi";
import { APIkey } from "../../utils/constants";
import { getTodaysDate, getLastWeeksDate } from "../../utils/Dates";
import { getArticles, getArticlesByToken } from "../../utils/api";

function App() {
  const [currentUser, setCurrentUser] = useState({
    loggedIn: false,
    email: "",
    password: "",
    username: "",
    savedNews: [],
  });
  const [activeModal, setActiveModal] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  const userContext = {
    currentUser,
    setCurrentUser,
  };

  const handleSearchSubmit = () => {
    if (currentKeyword === "") {
      setIsSuccess(true);
      return;
    }

    setIsLoading(true);
    setNewsData([]);
    setIsSuccess(false);
    setIsError(false);

    getNews(currentKeyword, APIkey, getLastWeeksDate(), getTodaysDate())
      .then((data) => {
        console.log(data);
        setIsLoading(false);
        setIsSuccess(true);
        setNewsData(data.articles);
      })
      .catch((err) => {
        console.error(err);
        setIsError(true);
      });
  };

  const handleLoginClick = () => {
    setActiveModal("login");
  };

  const closeActiveModal = () => {
    setActiveModal("");
  };

  const handleRegistration = (values, resetRegistrationForm) => {
    if (!values) return;

    registerUser(values)
      .then((res) => {
        setIsLoggedIn(true);
        setCurrentUser(res.data);
        resetRegistrationForm();
        closeActiveModal();
        setActiveModal("success");
      })
      .catch((res) => {
        console.log(`There is an error in handleUserRegistration: ${res}`);
      });
  };

  const handleLogin = (values, resetLoginForm) => {
    if (!values) {
      return;
    }

    signinUser(values)
      .then((res) => {
        setToken(res.token);
        return getUserByToken(res.token);
      })
      .then((user) => {
        setCurrentUser(user);
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

  const getUserArticles = () => {
    const jwt = getToken();
    if (!jwt) return;

    return getArticlesByToken(jwt).then(({ data }) => {
      return data;
    });
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

  useEffect(() => {
    const jwt = getToken();
    if (!jwt) {
      setCurrentUser((prevState) => ({
        ...prevState,
      }));
      return;
    }
    getUserArticles().then((articles) => {
      getUserByToken(jwt)
        .then((userData) => {
          setCurrentUser((prevState) => ({
            ...prevState,
            loggedIn: true,
            username: userData.username,
            email: userData.email,
            savedNews: articles,
          }));
        })
        .catch((err) => console.error(err));
    });
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token || token === "undefined") {
      return;
    }

    getUserByToken(token)
      .then((res) => {
        setCurrentUser(res);
        setIsLoggedIn(true);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="app">
      <CurrentUserContext.Provider value={userContext}>
        <div className="app__content">
          <Routes>
            <Route
              path="/"
              element={
                <Main
                  handleLoginClick={handleLoginClick}
                  isLoggedIn={isLoggedIn}
                  handleLogout={handleLogout}
                  handleSearchSubmit={handleSearchSubmit}
                  newsData={newsData}
                  isSuccess={isSuccess}
                  isLoading={isLoading}
                  isError={isError}
                  setCurrentKeyword={setCurrentKeyword}
                />
              }
            ></Route>
            <Route
              path="/saved-news"
              element={
                <SavedNews
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
          <SuccessModal
            isOpen={activeModal === "success"}
            onClose={closeActiveModal}
            setActiveModal={setActiveModal}
          />
        </div>
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;

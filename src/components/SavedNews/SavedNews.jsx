import "../SavedNews/SavedNews.css";
import Nav from "../Nav/Nav";
import SavedNewsHeader from "../SavedNewsHeader/SavedNewsHeader";
import { pageAppearances } from "../../utils/pageAppearances";

function SavedNews({ handleHamburgerClick }) {
  const isInverse = pageAppearances.home === "dark";

  return (
    <div className="saved-news">
      <Nav isInverse={isInverse} handleHamburgerClick={handleHamburgerClick} />
      <SavedNewsHeader />
    </div>
  );
}

export default SavedNews;

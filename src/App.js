import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import logo from "./img/marvel-logo.png";
import "./App.css";

function App() {
  // ********** States **********
  const [characters, setCharacters] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState();
  const [pageNumberLimit, setPageNumberLimit] = useState(1);
  const [maxPageNumber, setMaxPageNumber] = useState(1);
  const [minPageNumber, setMinPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allPage, setAllPage] = useState([]);
  // ****************************

  // ********** API Calls & Session Storage **********
  useEffect(() => {
    const getData = async () => {
      try {
        let getCharacter = sessionStorage.getItem("items");
        let getAllPage = sessionStorage.getItem("allPage");
        let getTotalPage = sessionStorage.getItem("totalPage");

        if (getAllPage) {
          setTotalPage(getTotalPage);
          getAllPage = JSON.parse(getAllPage);
          if (getAllPage.includes(currentPage)) {
            setCharacters(
              JSON.parse(getCharacter).slice(
                getAllPage.indexOf(currentPage) * itemsPerPage,
                (getAllPage.indexOf(currentPage) + 1) * itemsPerPage
              )
            );
          } else {
            setLoading(true);
            getCharacter = JSON.parse(getCharacter);
            const res = await axios.get(
              `https://gateway.marvel.com:443/v1/public/characters?limit=${itemsPerPage}&offset=${
                currentPage * itemsPerPage
              }&apikey=589b3790decde7523a199df645a07418`
            );
            const data = res.data.data.results;
            getCharacter = getCharacter.concat(data);
            sessionStorage.setItem("items", JSON.stringify(getCharacter));
            setCharacters(data);
            getAllPage.push(currentPage);
            sessionStorage.setItem("allPage", JSON.stringify(getAllPage));
            setLoading(false);
          }
        } else {
          setLoading(true);
          const res = await axios.get(
            `https://gateway.marvel.com:443/v1/public/characters?limit=${itemsPerPage}&offset=${
              currentPage * itemsPerPage
            }&apikey=589b3790decde7523a199df645a07418`
          );
          const data = res.data.data.results;
          const totalData = res.data.data.total;

          sessionStorage.setItem("items", JSON.stringify(data));
          sessionStorage.setItem("totalPage", totalData);

          allPage.push(currentPage);
          sessionStorage.setItem("allPage", JSON.stringify(allPage));

          setCharacters(data);
          setTotalPage(totalData);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, [currentPage, itemsPerPage]);
  // *************************************************

  // ********** Pagination Number **********
  const pages = [];
  for (let i = 1; i <= Math.ceil(totalPage / itemsPerPage); i++) {
    pages.push(i);
  }
  const pageNumbers = pages.map((n, index) => {
    if (n - 2 < maxPageNumber + 2 && n + 1 > minPageNumber) {
      return (
        <li
          key={index}
          onClick={() => {
            setCurrentPage(n - 1);
          }}
          className={currentPage == n - 1 ? "active" : null}
        >
          {n}
        </li>
      );
    } else {
      return null;
    }
  });
  // ***************************************

  // ********** Prev & Next Button Functions **********
  const nextPageBtn = () => {
    setCurrentPage(currentPage + 1);

    if (currentPage + 1 > maxPageNumber) {
      setMaxPageNumber(maxPageNumber + pageNumberLimit);
      setMinPageNumber(minPageNumber + pageNumberLimit);
    }
  };

  const prevPageBtn = () => {
    setCurrentPage(currentPage - 1);
    if (currentPage - 2 < minPageNumber) {
      setMaxPageNumber(maxPageNumber - pageNumberLimit);
      setMinPageNumber(minPageNumber - pageNumberLimit);
    }
  };
  // **************************************************

  // ********** "..." Buttons **********
  const threeDatNext = () => {
    if (currentPage + 2 >= maxPageNumber && currentPage <= pages.length - 11) {
      setCurrentPage(currentPage + 10);
      setMaxPageNumber(maxPageNumber + 10);
      setMinPageNumber(minPageNumber + 10);
    }
  };
  const threeDatPrev = () => {
    if (currentPage >= pages[9]) {
      setCurrentPage(currentPage - 10);
      setMaxPageNumber(maxPageNumber - 10);
      setMinPageNumber(minPageNumber - 10);
    } else {
      setCurrentPage(0);
      setMaxPageNumber(0);
      setMinPageNumber(0);
    }
  };
  // ***********************************

  // ********** First & Last Item Buttons **********
  const getFirstItem = () => {
    setCurrentPage(0);
    setMaxPageNumber(0);
    setMinPageNumber(0);
  };

  const getLastItem = () => {
    setMaxPageNumber(pages.length);
    setMinPageNumber(pages.length - 1);
  };
  // ***********************************************

  // ********** First & Last / "..." Buttons Conditions **********
  let datNextBtn = null;
  let lastItem;
  let threeDatBtnLast;
  if (pages.length > maxPageNumber && currentPage < pages[pages.length - 5]) {
    lastItem = (
      <li
        onClick={() => {
          setCurrentPage(pages[pages.length - 2]);
          getLastItem();
        }}
      >
        {pages[pages.length - 1]}
      </li>
    );
    threeDatBtnLast = <li onClick={threeDatNext}> ... </li>;
    datNextBtn = <li onClick={nextPageBtn}> &raquo; </li>;
  }

  let datBackBtn = null;
  let threeDatBtnFirst;
  let firstItem;
  if (minPageNumber >= 2) {
    datBackBtn = <li onClick={prevPageBtn}> &laquo; </li>;
    threeDatBtnFirst = <li onClick={threeDatPrev}> ... </li>;
    firstItem = <li onClick={getFirstItem}>{pages[0]}</li>;
  }
  // *************************************************************

  return (
    <div className="App">
      {loading && (
        <div className="loadingContainer">
          <span className="loading"></span>
          <p>Yükleniyor...</p>
        </div>
      )}
      <header>
        <div id="logo">
          <img id="marvelLogo" src={logo} alt="Marvel Logo" />
        </div>
      </header>
      <div className="container">
        <div className="allCard">
          {/* Map Characters */}
          {characters.map((item, index) => {
            return (
              <div className="card" key={index}>
                <div className="card-image">
                  <img
                    src={
                      `${item.thumbnail.path}.${item.thumbnail.extension}` ===
                        "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg" ||
                      `${item.thumbnail.path}.${item.thumbnail.extension}` ===
                        "http://i.annihil.us/u/prod/marvel/i/mg/f/60/4c002e0305708.gif"
                        ? "https://i.pinimg.com/originals/24/92/00/249200c431fe811110761709b303fcaf.jpg"
                        : `${item.thumbnail.path}.${item.thumbnail.extension}`
                    }
                  />
                </div>
                <div className="card-title">
                  <a href={item.urls[0].url} target="_blank">
                    {item.name}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        <div className="paginationBox">
          <ul className="pagination">
            {/* Pagination Items */}
            {datBackBtn}
            {firstItem}
            {threeDatBtnFirst}
            {pageNumbers}
            {threeDatBtnLast}
            {lastItem}
            {datNextBtn}
            {/* **************** */}
          </ul>
          <div className="paginationInfo">
            <p>
              <b>{totalPage}</b> karakterden {currentPage * itemsPerPage} -{" "}
              {(currentPage + 1) * itemsPerPage} arasını görüntülüyorsunuz.
            </p>
          </div>
          {/* <div className="paginationOptions">
            <form>
              <label>Her sayfada </label>
              <select onChange={(e) => setItemsPerPage(e.target.value)}>
                <option value={8}>8</option>
                <option selected value={12}>
                  12
                </option>
                <option value={16}>16</option>
                <option value={20}>20</option>
              </select>
              <label> sonuç göster</label>
            </form>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import TvShows from "./pages/TVShows";
import TopIMDB from "./pages/TopIMDB";
import SearchResults from "./pages/SearchResults";
import MovieDetails from "./pages/MovieDetails";
import TVDetails from "./pages/TVDetails";
import ListDetails from "./pages/ListDetails";
import FeaturedLists from "./pages/FeaturedLists";
import AdminFeaturedLists from "./pages/AdminFeaturedLists";
import UserProfile from "./components/UserProfile";
import "./App.css";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv-shows" element={<TvShows />} />
            <Route path="/top-imdb" element={<TopIMDB />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<TVDetails />} />
            <Route path="/list/:id" element={<ListDetails />} />
            <Route path="/list/edit/:id" element={<ListDetails mode="edit" />} />
            <Route path="/featured-lists" element={<FeaturedLists />} />
            <Route path="/admin/featured-lists" element={<AdminFeaturedLists />} />
            <Route path="/profile" element={<UserProfile initialTab="profile" />} />
            <Route path="/watchlist" element={<UserProfile initialTab="watchlist" />} />
            <Route path="/my-lists" element={<UserProfile initialTab="lists" />} />
            <Route path="/logout" element={<Home logout={true} />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;

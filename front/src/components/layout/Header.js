import React from "react";
import { Link } from "react-router-dom";
import AuthOptions from "../auth/AuthOptions";

export default function Header() {
  return (
    <header id="header">
      <Link to="/">
        <h1 className="title">글판기 프로젝트</h1>
      </Link>
      <AuthOptions />
    </header>
  );
}

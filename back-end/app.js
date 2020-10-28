const express = require("express");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();
const { sequelize } = require("./models");
const indexRouter = require("./routes");

const cors = require("cors"); //
const app = express();
app.set("port", process.env.PORT || 3001);
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

// CORS란 Cross Origin Resource Sharing의 약자로, 현재 도메인과 다른 도메인으로 리소스가 요청될 경우를 말한다.
// 보안상의 이유로 cors를 제한하고 있는데, rest api 사용 시 cors제한에 걸릴 수 있다.
app.use(cors());
app.use(morgan("dev"));
// static 미들웨어는 특정 폴더의 파일들을 특정 패스로 접근할 수 있도록 함
// 루트 패스로 접근할 수 있도록 views 폴더 설정
app.use("/", express.static(path.join(__dirname, "views")));
// JSON 형식의 데이터 전달 방식
app.use(express.json());
// 주소 형식으로 데이터를 보내는 방식이다. extended: false이면 노드의 querystring 모듈을 사용하여 쿼리스트링을 해석한다.
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});

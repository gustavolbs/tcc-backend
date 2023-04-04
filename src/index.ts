import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 8000;

async function main() {
  try {
    app.listen(port, () => {
      console.log(`App rodando na porta ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

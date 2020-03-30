import TableGenerator from "./tableGenerator.ts";
import './styles/style.scss';

const container = document.body.querySelector("#content");
const tableGenerator = new TableGenerator(container);
tableGenerator.render();
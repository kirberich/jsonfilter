import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import "./assets/main.css";

/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import specific icons */
import { faPlus } from "@fortawesome/free-solid-svg-icons";

library.add(faPlus);

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);

app.component("font-awesome-icon", FontAwesomeIcon).mount("#app");

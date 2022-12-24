<template>
  <main>
    <h1>JSON Cleaner 🧹</h1>
    <textarea placeholder="Paste json here" v-model="data" />
    <div class="errors">
      <span v-for="error in errors" :key="error">{{ error }}</span>
    </div>
    <filter-container />
    <textarea
      placeholder="Filtered json"
      v-model="formattedFilteredData"
      readonly="true"
    />
    {{ filteredJsonData.length }} out of {{ parsedJsonData.length }} entries
    match
    <button @click="copyData">Copy to clipboard</button>
  </main>
</template>

<style>
textarea {
  width: 100%;
  height: 250px;
}
.errors {
  color: rgb(200, 0, 0);
}
</style>

<script>
import FilterContainer from "../components/FilterContainer.vue";
import { useFilterStore } from "@/stores/filters";
import { mapStores, mapState } from "pinia";

export default {
  name: "HomeView",
  components: { FilterContainer },
  mounted() {
    const params = new URLSearchParams(window.location.search);
    let storedFilters = {};
    let nextFilterId = 1;
    for (const [rawName, value] of params) {
      let filterField = rawName;
      let filterOperator = "exact";
      let filterValue = value;

      if (rawName.includes("__")) {
        const splitByOperator = rawName.split("__");
        filterField = splitByOperator[0];
        filterOperator = splitByOperator[1];
      }
      const filter = {
        field: filterField,
        operator: filterOperator,
        value: filterValue,
        id: nextFilterId,
      };
      storedFilters[nextFilterId] = filter;
      nextFilterId++;
    }

    this.filterStore.setFilters(storedFilters, nextFilterId);
  },
  methods: {
    copyData: function () {
      navigator.clipboard.writeText(this.formattedFilteredData);
    },
  },
  computed: {
    ...mapStores(useFilterStore),
    ...mapState(useFilterStore, [
      "filters",
      "rawJsonData",
      "errors",
      "filteredJsonData",
      "parsedJsonData",
      "formattedFilteredData",
    ]),
    data: {
      get() {
        return this.rawJsonData;
      },
      set(newValue) {
        this.filterStore.updateRawData(newValue);
      },
    },
  },
  watch: {
    parsedData() {
      // this.run();
    },
  },
};
</script>

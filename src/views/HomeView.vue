<template>
  <main>
    <div class="intro">
      Paste JSON below and add filters to clean the data. Everything is done
      locally, the data never leaves your computer.
    </div>
    <textarea placeholder="Paste json here" @input="updateData" />
    <div class="errors">
      <span v-for="error in errors" :key="error">{{ error }}</span>
    </div>
    <filter-container />
    <h2>
      Results <span v-if="isFiltering" class="filtering">Filtering...</span>
    </h2>
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
.h1 {
  margin-bottom: 0;
}
.filtering {
  display: inline-block;
  font-size: 8pt;
}
.intro {
  margin-left: 10px;
  font-style: italic;
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
    updateData: function (event) {
      const timeoutId = window.setTimeout(() => {}, 0);
      const filterStore = this.filterStore;
      for (let id = timeoutId; id >= 0; id -= 1) {
        window.clearTimeout(id);
      }

      setTimeout(() => {
        filterStore.updateRawData(event.target.value);
      }, 200);
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
      "isFiltering",
    ]),
  },
};
</script>

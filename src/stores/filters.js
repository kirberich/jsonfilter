// stores/counter.js
import { defineStore } from "pinia";

const FILTER_OPERATORS = {
  exact: function (item, filter) {
    if (Array.isArray(item[filter.field])) {
      return {
        error: `Cannot check for equals for ${filter.field}, field is a list. try 'contains' instead!`,
        matches: false,
      };
    }

    return String(item[filter.field]) == filter.value;
  },
  "not-exact": function (item, filter) {
    if (Array.isArray(item[filter.field])) {
      return {
        error: `Cannot check for 'doesn't equal' for ${filter.field}, field is a list. try 'doesn't contain' instead!`,
        matches: false,
      };
    }

    return String(item[filter.field]) != filter.value;
  },
  empty: function (item, filter) {
    return item[filter.field] == null || item[filter.field] == "";
  },
  "not-empty": function (item, filter) {
    return item[filter.field] != null && item[filter.field] != "";
  },
  contains: function (item, filter) {
    if (typeof item[filter.field] === "string") {
      return item[filter.field].includes(filter.value);
    }

    if (Array.isArray(item[filter.field])) {
      for (const entry of item[filter.field]) {
        if (entry == filter.value) {
          return true;
        }
      }
      return false;
    }
  },
  "not-contains": function (item, filter) {
    if (typeof item[filter.field] === "string") {
      return !item[filter.field].includes(filter.value);
    }

    if (Array.isArray(item[filter.field])) {
      for (const entry of item[filter.field]) {
        if (entry == filter.value) {
          return false;
        }
      }
      return true;
    }
  },
};

export const useFilterStore = defineStore("filter", {
  state: () => {
    return {
      nextFilterId: 1,
      filters: {},
      rawJsonData: "",
      dataIsValid: true,
      parseTimer: null,
      filterTimer: null,
      isFiltering: true,
      errors: [],
      parsedJsonData: [],
      filteredJsonData: [],
    };
  },
  getters: {
    formattedFilteredData() {
      return JSON.stringify(this.filteredJsonData, null, 2);
    },
  },
  actions: {
    // Data
    updateRawData(newData) {
      this.rawJsonData = newData;
      this.scheduleParsing();
    },
    scheduleFiltering() {
      // Set (or reset) a timer to run the filtering
      if (this.filterTimer) {
        clearTimeout(this.filterTimer);
      }
      this.filterTimer = setTimeout(this.applyFilters, 500);
      this.isFiltering = true;
    },
    scheduleParsing() {
      // Set (or reset) a timer to run the parsing
      if (this.parseTimer) {
        clearTimeout(this.parseTimer);
      }
      this.parseTimer = setTimeout(this.parseData, 500);
    },
    parseData() {
      // parse the latest raw data into json
      if (this.rawJsonData == "") {
        // Empty data is always valid
        this.dataIsValid = true;
        this.parsedJsonData = [];
        return;
      }

      try {
        var asJson = JSON.parse(this.rawJsonData);

        if (Array.isArray(asJson)) {
          this.parsedJsonData = asJson;
          this.dataIsValid = true;
          this.errors = [];
        } else {
          this.dataIsValid = false;
          this.errors = { "": "JSON data should be a list of objects!" };
        }
      } catch (e) {
        this.dataIsValid = false;
        this.errors = { "": "Invalid json" };
      }

      // After parsing, reapply filters
      if (this.errors.length == 0) {
        this.applyFilters();
      } else {
        console.log("errors found, not filtering");
        console.log(this.errors);
      }
    },
    // Filtering
    addFilter() {
      const filterId = this.nextFilterId;
      this.nextFilterId++;

      this.filters[filterId] = {
        id: filterId,
        field: "",
        value: "",
        operator: "exact",
      };

      this.scheduleFiltering();
    },
    deleteFilter(filterId) {
      delete this.filters[filterId];

      this.scheduleFiltering();
    },
    updateFilterValue(filterId, newValue) {
      this.filters[filterId].value = newValue;

      this.scheduleFiltering();
    },
    updateFilterField(filterId, newField) {
      this.filters[filterId].field = newField;

      this.scheduleFiltering();
    },
    updateFilterOperator(filterId, newOperator) {
      this.filters[filterId].operator = newOperator;

      this.scheduleFiltering();
    },
    setFilters(newFilters, nextFilterId) {
      this.filters = newFilters;
      this.nextFilterId = nextFilterId;
      this.scheduleFiltering();
    },
    storeFilters() {
      var searchParams = new URLSearchParams();
      for (const filter of Object.values(this.filters)) {
        searchParams.set(`${filter.field}__${filter.operator}`, filter.value);
      }
      const asString = searchParams.toString();
      var newurl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?" +
        asString;
      window.history.pushState({ path: newurl }, "", newurl);
    },
    applyFilter(item, filter) {
      if (filter.field == "") {
        return true;
      }
      if (item[filter.field] === undefined) {
        return {
          error: `Field ${filter.field} not present!`,
          matches: false,
        };
      }

      const operator = FILTER_OPERATORS[filter.operator];
      const result = operator(item, filter);
      return result;
    },
    async applyFilters() {
      console.log("applying filters...");
      await new Promise((r) => setTimeout(r, 1));
      this.storeFilters();

      let newFilteredData = [];
      let newErrors = {};
      for (const item of this.parsedJsonData) {
        let itemMatches = true;

        for (const filter of Object.values(this.filters)) {
          let result = this.applyFilter(item, filter);
          if (typeof result === "boolean") {
            result = { matches: result };
          }
          if (result.error) {
            newErrors[filter.field] = result.error;
          }
          if (!result.matches) {
            itemMatches = false;
            break;
          }
        }

        if (itemMatches) {
          newFilteredData.push(item);
        }
      }

      this.filteredJsonData = newFilteredData;
      this.errors = newErrors;
      this.isFiltering = false;
      console.log("done");
    },
  },
});

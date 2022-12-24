<template>
  <div class="filter-container">
    <div class="filter-title">
      <h2>Filters</h2>
    </div>

    <div class="filters">
      <div v-for="filter in filters" :key="filter.id" class="filter">
        <div class="filter-element">
          <input
            type="text"
            :value="filter.field"
            @input="updateField"
            :data-filter-id="filter.id"
            placeholder="Field"
          />

          <select
            :value="filter.operator"
            @input="updateOperator"
            :data-filter-id="filter.id"
            class="filter-operator"
          >
            <option value="exact">Equals</option>
            <option value="empty">Is Empty</option>
            <option value="not-empty">Is Not Empty</option>
            <option value="contains">Contains</option>
          </select>

          <template v-if="['exact', 'contains'].includes(filter.operator)">
            <input
              type="text"
              :value="filter.value"
              @input="updateValue"
              :data-filter-id="filter.id"
              placeholder="value"
            />
          </template>
        </div>
        <a @click="deleteFilter(filter)" href="#" class="delete-filter">❌</a>
      </div>
      <a @click="addFilter" href="#">Add filter</a>
    </div>
  </div>
</template>

<style lang="scss">
.filter-container {
  a {
    text-decoration: none;
    color: rgb(00, 100, 100);
  }
  a.delete-filter {
    padding-left: 5px;
    font-size: 10pt;
  }
}
.filter-element {
  display: inline-block;
}
.filter-operator {
  font-size: 10pt;
  margin-left: 5px;
  margin-right: 5px;
}
.filters {
  padding: 10px;
}
.vue3-autocomplete-container {
  display: inline;
}
</style>

<script>
import { useFilterStore } from "@/stores/filters";
import { mapStores, mapState } from "pinia";

export default {
  name: "FilterContainer",
  components: {},
  computed: {
    ...mapStores(useFilterStore),
    ...mapState(useFilterStore, ["filters"]),
  },
  methods: {
    addFilter: function () {
      this.filterStore.addFilter();
    },
    deleteFilter: function (filter) {
      this.filterStore.deleteFilter(filter.id);
    },
    updateValue: function (event) {
      const element = event.target;
      const filterId = element.getAttribute("data-filter-id");
      this.filterStore.updateFilterValue(filterId, element.value);
    },
    updateField: function (event) {
      const element = event.target;
      const filterId = element.getAttribute("data-filter-id");
      this.filterStore.updateFilterField(filterId, element.value);
    },
    updateOperator: function (event) {
      const element = event.target;
      const filterId = element.getAttribute("data-filter-id");
      this.filterStore.updateFilterOperator(filterId, element.value);
    },
  },
};
</script>

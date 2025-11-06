import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async fetcher for properties
export const fetchProperties = createAsyncThunk(
  "properties/fetchProperties",
  async (_, { getState, rejectWithValue }) => {
    const { filters, page, limit } = getState().properties;
    try {
      const qs = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          if (key === "verified" && value) qs.set("verified", "1");
          else qs.set(key, value);
        }
      });

      qs.set("page", page);
      qs.set("limit", limit);

      const res = await fetch(`/api/properties?${qs.toString()}`, {
        cache: "no-store",
      });
      
      if (!res.ok) throw new Error("Failed to fetch properties");
      
      const data = await res.json();
      console.log("redux api:", data)
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  view: "grid",
  filters: {
    q: "",
    type: "",
    category: "",
    purpose: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    verified: false,
    state: "",
    city: "",
    minBeds: "",
    minBaths: "",
    minSize: "",
    maxSize: "",
    kitchen_available: "",
    toilet_available: "",
  },
  properties: [],
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
  limit: 9,
};

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    setView: (state, action) => {
      state.view = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // reset page when filters change
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        const data = action.payload;
        state.loading = false;
        state.properties = data.data || [];
        state.totalPages = data.pagination?.totalPages || 1;
        state.hasNext = data.pagination?.hasNext || false;
        state.hasPrev = data.pagination?.hasPrev || false;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch";
        state.properties = [];
      });
  },
});

export const { setView, setFilters, setPage, resetFilters } =
  propertiesSlice.actions;
export default propertiesSlice.reducer;

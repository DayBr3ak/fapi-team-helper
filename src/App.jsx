import React from "react";
import "./App.css";
import { Provider } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TabContainer from "./components/TabContainer";
import { store } from "./utils/store";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "Roboto",
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <TabContainer />
      </ThemeProvider>
    </Provider>
  );
}

export default App;

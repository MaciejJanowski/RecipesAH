import {
  ChakraProvider,
  Box,
  Container,
  Heading,
  Stack,
  Input,
  Button,
  Text,
  Select,
  List,
  ListItem,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import axios from "axios";
import React from "react";

class Search extends React.Component {
  state = {
    query: "",
    data: [],
    baseUrl: "",
    showMenu: false,
  };

  searchInSpooncular() {
    axios
      .get(
        `https://api.spoonacular.com/food/ingredients/search?apiKey=27abea2449fa44a398beafe2c390d86d&query=${this.state.query}&number=5`
      )
      .then((res) => {
        this.setState(
          { data: res.data.results, baseUrl: res.baseUrl, query: "" },
          this.storeInLocalStorage(this.state.query, res.data.results)
        );
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  }

  handleQuery = () => {
    let stored_result = this.getFromLocalStorage(this.state.query);
    if (stored_result.length) {
      this.setState({ data: stored_result });
    } else {
      this.searchInSpooncular();
    }
  };

  removeOldestStoredResults() {
    let all_local_storage_results = Object.keys(localStorage) || [];
    let oldest_search_result = all_local_storage_results[0];
    all_local_storage_results.forEach(function (variable_name, index) {
      let stored_result = localStorage.getItem(variable_name);
      if (oldest_search_result.created > stored_result.created) {
        oldest_search_result = variable_name;
      }
    });
    localStorage.removeItem(oldest_search_result);
  }

  storeInLocalStorage = (variable, data) => {
    let created_dt = new Date().getTime() / 1000;
    let stored_data = Object.assign({}, { results: data, created: created_dt });
    const amount_of_results_stored = Object.keys(localStorage).length;
    if (amount_of_results_stored >= 10) {
      this.removeOldestStoredResults();
    }
    localStorage.setItem(variable, JSON.stringify(stored_data));
  };

  getFromLocalStorage = (variable) => {
    let search_history = JSON.parse(localStorage.getItem(variable)) || {};
    return search_history.length ? search_history : [];
  };

  setFromLocalStorage = (variable) => {
    let search_history = JSON.parse(localStorage.getItem(variable)) || {};
    this.setState({ data: search_history?.results });
  };

  handleTextSearchChange = (event) => {
    this.setState({ query: event.target.value });
  };

  firstLetterToUpperCase = (string = "") => {
    return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
  };

  render() {
    const stored_results = Object.keys(localStorage) || [];
    const data = this.state.data || [];
    return (
      <ChakraProvider>
        <Box p={4}>
          <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
            <Heading fontSize={"3xl"}>Spooncular API Search</Heading>
            <Input placeholder="Please type query" onChange={this.handleTextSearchChange} />
            <Button variantcolor="teal" onClick={this.handleQuery}>
              <SearchIcon>Search</SearchIcon>
            </Button>
            <Container mt={6}>
              <Heading fontSize={"3xl"}>Stored Results</Heading>
              <Select
                onClick={(event) => this.setFromLocalStorage(event.target.value)}
                placeholder="Select from stored results"
              >
                {stored_results.map((result) => (
                  <option key={result} value={result}>
                    {this.firstLetterToUpperCase(result)}
                  </option>
                ))}
              </Select>
            </Container>
          </Stack>

          <Container maxW={"6xl"} mt={10}>
            <List columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
              {data.length
                ? this.state.data.map((ingredient) => (
                    <ListItem key={ingredient.id} align={"top"}>
                      <Text fontWeight={600}>{ingredient.name}</Text>
                    </ListItem>
                  ))
                : null}
            </List>
          </Container>
        </Box>
      </ChakraProvider>
    );
  }
}

export default Search;

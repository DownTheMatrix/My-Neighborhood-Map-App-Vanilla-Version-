import React from "react";
import { withStyles } from "@material-ui/core/styles";  // Style wrapper
import Input from "@material-ui/core/Input";  // src: https://github.com/mui-org/material-ui/blob/master/docs/src/pages/demos/text-fields/Inputs.js

/* Input component style */
const styles = theme => ({
    container: {
      display: "flex",
      flexWrap: "wrap"
    },
    input: {
      margin: theme.spacing.unit,
      color: "#fff",
      borderBottom: "1px solid #000",
      width: "100%"
    },
  });

function FilterLocations ( props ) {

    const { classes } = props;

    return (
        <div className = { classes.container }>
            <form aria-label="search your location">
                <Input
                    className = { classes.input }
                    type = "text"
                    placeholder = { "Search for your venue" }
                    inputProps = {{ "aria-label" : "Query" }}
                    onChange = { props.onChange }
                />
            </form>
        </div>
    );
}

export default withStyles(styles)(FilterLocations);
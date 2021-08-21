import React, { useEffect,useLayoutEffect, useRef, useState, Fragment } from "react";

import {
	makeStyles,
    NativeSelect,
    InputLabel,
    Select
} from '@material-ui/core';
// import ThumbUpIcon from '@material-ui/icons/ThumbUp';
// import ThumbDownIcon from '@material-ui/icons/ThumbDown';
// import FlagIcon from '@material-ui/icons/Flag'; 

// import UserLink from "./UserLink.js";
// import UmatiLink from "./UmatiLink.js";

// import {
//     Link
//   } from "react-router-dom";

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
    },
    content: {
      flex: '1 0 auto',
    },
    cover: {
      width: 151,
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      paddingLeft: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    },
    playIcon: {
      height: 38,
      width: 38,
    },
  }));

function SortDropdown (props) {
    const classes = useStyles();
    const newIsDefault = props.newdefault;

    const [currentSort, setCurrentSort] = useState(newIsDefault ? "new" : "trending");
    
   
    useLayoutEffect (() => {
        var searchParams = new URLSearchParams(window.location.search);
        var sort = searchParams.get("sort");
        setCurrentSort(sort);
        
    }, []);

    const handleChange = (event) => {
        const value = event.target.value;
        var searchParams = new URLSearchParams(window.location.search);
        searchParams.set("sort", value);
        window.location.search = searchParams.toString();
    };
    
    return (
        <div key="PostCardContainer" className="PostCardContainer" style={{marginTop: "5px"}}>
            {/* <FormControl className={classes.formControl}> */}
        <InputLabel htmlFor="sort-native-simple">Sort</InputLabel>
        <Select
          native
          value={currentSort}
          onChange={handleChange}
          inputProps={{
            name: 'sort',
            id: 'sort-native-simple',
          }}
        >
        {newIsDefault ? 
        (
        <Fragment>
            <option value={"new"}>New (default)</option>
            <option value={"trending"}>Trending</option>
        </Fragment>
        ): (
        <Fragment>
            <option value={"trending"}>Trending (default)</option>
            <option value={"new"}>New</option>
        </Fragment>)
        }
          
          <option value={"top"}>Top</option>
          <option value={"controversial"}>Controversial</option>
          <option value={"old"}>Old</option>
        </Select>
      {/* </FormControl> */}
    </div>
    );
}

export default SortDropdown;
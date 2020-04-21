import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Home from '../dashboard/Home.jsx';
import Notes from '../dashboard/Notes.jsx';
import Users from '../dashboard/Users.jsx';
import Library from '../dashboard/Library.jsx';
import About from '../dashboard/About.jsx';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`nav-tabpanel-${index}`}
      aria-labelledby={`nav-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `nav-tab-${index}`,
    'aria-controls': `nav-tabpanel-${index}`,
  };
}

function LinkTab(props) {
  return (
    <Tab
      component="a"
      onClick={(event) => {
        event.preventDefault();
      }}
      {...props}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function NavTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs
        variant="fullWidth"
        value={value}
        onChange={handleChange}
        aria-label="dashboard navigation tabs"
      >
        <LinkTab label="Home" href="/" {...a11yProps(0)} />
        <LinkTab label="Notes" href="/notes" {...a11yProps(1)} />
        <LinkTab label="Users" href="/users" {...a11yProps(2)} />
        <LinkTab label="Library" href="/library" {...a11yProps(3)} />
        <LinkTab label="About" href="/about" {...a11yProps(4)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Home />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Notes />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Users />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Library />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <About />
      </TabPanel>
    </div>
  );
}

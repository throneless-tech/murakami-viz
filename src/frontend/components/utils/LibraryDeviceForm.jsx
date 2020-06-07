// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
// import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
import TextField from '@material-ui/core/TextField';
// import Typography from '@material-ui/core/Typography';

// icon imports
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles(() => ({
  appBar: {
    backgroundColor: '#fff',
    borderBottom: '1px solid rgba(0, 0, 0, 0.54)',
    boxShadow: 'none',
  },
  cancelButton: {},
  closeButton: {
    marginTop: '15px',
    position: 'absolute',
    right: '0',
    top: '0',
  },
  dialog: {
    position: 'relative',
  },
  dialogTitleRoot: {
    // marginTop: "30px",
  },
  dialogTitleText: {
    fontSize: '2.25rem',
    textAlign: 'center',
  },
  form: {
    padding: '50px',
  },
  formControl: {
    width: '100%',
  },
  formField: {
    marginBottom: '30px',
  },
  grid: {
    // marginLeft: "",
    marginTop: '50px',
  },
  gridItem: {
    marginLeft: '30px',
  },
  inline: {
    marginLeft: '20px',
  },
  saveButton: {
    marginBottom: '0',
  },
  saveButtonContainer: {
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
  },
}));

export default function LibraryDeviceForm(props) {
  const classes = useStyles();
  const { onClose, open, row, editMode, device, devices, setDevices } = props;

  console.log("library ? ", row)

  const handleClose = () => {
    onClose();
  }

  const [inputs, setInputs] = React.useState({})
  
  console.log("we editing or nah? ", editMode)
  console.log("editing which one?", device)

  const handleInputChange = (event) => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value
    }));
  }

  const handleSubmit = event => {
    event.preventDefault();

    fetch(`/api/v1/libraries/${row.id}/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs)
    })
    .then(response => response.json())
    .then(results => {
       if (results.statusCode === 201) {
         let updatedDevices = devices.concat(inputs);
         setDevices(updatedDevices)
       }
    })
    .catch(error => {
      alert("An error occurred. Please try again or contact an administrator.")
    })
    onClose();
  }

  const handleEdit = deviceToEdit => {
    fetch(`api/v1/devices/${deviceToEdit.id}`, {
      method: 'PUT',
      headers: {
      'Content-Type': 'application/json',
    },
      body: JSON.stringify(inputs)
    })
    .then(response => response.json())
    .then(results => {
      if (results.statusCode === 200) {
        console.log(results)
      }
    })
    onClose();
  }


  return (
    <Dialog
      onClose={handleClose}
      modal={true}
      open={open}
    >
      <Button
        label="Close"
        primary={true}
        onClick={handleClose}
        className={classes.closeButton}
      >
        <ClearIcon />
      </Button>
      <Grid
        container
        alignItems="center"
        justify="flex-start"
        className={classes.grid}
      >
        <Grid item className={classes.gridItem}>
          <DialogTitle
            id="add-library-title"
            className={classes.dialogTitleRoot}
          >
            <div className={classes.dialogTitleText}>{ editMode ? `Edit device` : `Add a new device` } </div>
          </DialogTitle>
        </Grid>
        <Grid item className={classes.gridItem}>
          <Button
            type="submit"
            label="Save"
            onClick={handleSubmit}
            className={classes.cancelButton}
            variant="contained"
            disableElevation
            color="primary"
            primary={true}
          >
            Submit
          </Button>
        </Grid>
        <Grid item className={classes.gridItem}>
          <Button
            size="small"
            label="Cancel"
            primary={true}
            onClick={handleClose}
            className={classes.cancelButton}
          >
            Cancel
          </Button>
          </Grid>
          <Box m={4}>
            <TextField
              className={classes.formField}
              id="library-device-name"
              label="Device name"
              name="name"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
              defaultValue={ editMode ? device.name : `` }
              value={inputs.name}
            />
            <TextField
              className={classes.formField}
              id="library-deviceid"
              label="DeviceID"
              name="deviceid"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
              defaultValue={editMode ? device.deviceid : ``}
            value={inputs.deviceid}
            />
            <TextField
              className={classes.formField}
              id="library-device-location"
              label="Location"
              name="location"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
              defaultValue={editMode ? device.location : ``}
              value={inputs.location}
            />
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="library-network-type">Network type</InputLabel>
              <Select
                labelId="library-network-type"
                className={classes.formField}
                id="library-network-type"
                label="Network Type"
                name="network_type"
                defaultValue={editMode ? device.network_type : ``}
                onChange={handleInputChange}
                value={inputs.network_type}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="library-connection-type">
                Connection type
              </InputLabel>
              <Select
                labelId="library-connection-type"
                className={classes.formField}
                id="library-connection-type"
                label="Connection Type"
                name="connection_type"
                defaultValue={ editMode ? device.connection_type : `` }
                onChange={handleInputChange}
                value={inputs.connection_type}
              >
                <MenuItem value="wired">Wired</MenuItem>
                <MenuItem value="wireless">Wireless</MenuItem>
              </Select>
            </FormControl>
            <TextField
              className={classes.formField}
              id="library-dns"
              label="DNS server"
              name="dns_server"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
              defaultValue={editMode ? device.dns_server : ``}
              value={inputs.dns_server}
            />
            <TextField
              className={classes.formField}
              id="library-device-ip"
              label="Static IP"
              name="ip"
              variant="outlined"
              onChange={handleInputChange}
              defaultValue={editMode ? device.ip : ``}
              value={inputs.ip}
            />
            <TextField
              className={classes.formField}
              id="library-gateway"
              label="Gateway"
              name="gateway"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
              defaultValue={editMode ? device.gateway : ``}
              value={inputs.gateway}
            />
            <TextField
              className={classes.formField}
              id="library-mac"
              label="MAC address"
              name="mac"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
              defaultValue={editMode ? device.mac : ``}
              value={inputs.mac}
            />
            <Button
              type="submit"
              label="Save"
              onClick={editMode ? ()=>handleEdit(device) : handleSubmit}
              className={classes.cancelButton}
              variant="contained"
              disableElevation
              color="primary"
              primary={true}
            >
              Submit
            </Button>
          </Box>
      </Grid>
    </Dialog>
  )

}

LibraryDeviceForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  editMode: PropTypes.bool,
  device: PropTypes.object,
  devices: PropTypes.array,
  setDevices: PropTypes.func
} 
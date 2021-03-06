// base imports
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import DateFnUtils from '@date-io/date-fns';
import _ from 'lodash/core';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';

// icons imports
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles(() => ({
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
    marginTop: '30px',
  },
  dialogTitleText: {
    fontSize: '2.25rem',
    textAlign: 'center',
  },
  form: {
    padding: '50px',
  },
  formField: {
    marginBottom: '30px',
  },
  datePicker: {
    marginBottom: '30px',
  },
  saveButton: {
    marginBottom: '0',
  },
}));

const useForm = (callback, validated) => {
  const [inputs, setInputs] = React.useState({});
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    if (validated(inputs)) {
      callback();
      setInputs({});
    }
  };
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value.trim(),
    }));
  };

  return {
    handleSubmit,
    handleInputChange,
    inputs,
  };
};

export default function AddNote(props) {
  const classes = useStyles();
  const { onClose, open, library } = props;
  const [date, setDate] = React.useState(new Date());
  const [errors, setErrors] = React.useState({});
  const [helperText, setHelperText] = React.useState({
    name: '',
  });

  // handle form validation
  const validateInputs = inputs => {
    setErrors({});
    setHelperText({});
    if (_.isEmpty(inputs)) {
      setErrors(errors => ({
        ...errors,
        subject: true,
      }));
      setHelperText(helperText => ({
        ...helperText,
        subject: 'Please enter a subject and description.',
      }));
      return false;
    } else {
      if (!inputs.subject || !inputs.description) {
        if (!inputs.subject) {
          setErrors(errors => ({
            ...errors,
            subject: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            subject: 'Please enter a subject.',
          }));
        }
        if (!inputs.description) {
          setErrors(errors => ({
            ...errors,
            description: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            description: 'Please enter a description.',
          }));
        }
        return false;
      } else {
        return true;
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  // handle api data errors
  const processError = res => {
    let errorString;
    if (res.statusCode && res.error && res.message) {
      errorString = `HTTP ${res.statusCode} ${res.error}: ${res.message}`;
    } else if (res.statusCode && res.status) {
      errorString = `HTTP ${res.statusCode}: ${res.status}`;
    } else {
      errorString = 'Error in response from server.';
    }
    return errorString;
  };

  // submit new note to api
  const submitData = () => {
    let status;

    // hand inserting the date into the request body
    const { subject, description } = inputs;
    const noteToSubmit = {
      subject,
      description,
      date: date.toISOString(),
    };

    fetch(`api/v1/libraries/${library.id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: noteToSubmit }),
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(result => {
        if (status === 201) {
          alert('Note submitted successfully.');
          onClose(noteToSubmit, result.data[0]); // this second arg is the ID of the newly created note
          return;
        } else {
          const error = processError(result);
          throw new Error(`Error in response from server: ${error}`);
        }
      })
      .catch(error => {
        alert(
          `An error occurred. Please try again or contact an administrator. ${
            error.name
          }: ${error.message}`,
        );
        onClose();
      });
  };

  const { inputs, handleInputChange, handleSubmit } = useForm(
    submitData,
    validateInputs,
  );

  React.useEffect(() => {}, [errors, helperText]);

  return (
    <Dialog
      onClose={handleClose}
      modal="true"
      open={open}
      aria-labelledby="add-note-title"
      fullWidth={true}
      maxWidth={'lg'}
      className={classes.dialog}
    >
      <Button
        label="Close"
        primary="true"
        onClick={handleClose}
        className={classes.closeButton}
      >
        <ClearIcon />
      </Button>
      <DialogTitle id="add-note-title" className={classes.dialogTitleRoot}>
        <div className={classes.dialogTitleText}>Add a Note</div>
      </DialogTitle>
      <Box className={classes.form}>
        <TextField
          error={errors && errors.subject}
          helperText={helperText.subject}
          className={classes.formField}
          id="note-subject"
          label="Subject"
          name="subject"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={inputs.subject || ''}
          required
        />

        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <DateTimePicker
            className={classes.datePicker}
            value={date}
            onChange={e => setDate(e)}
          />
        </MuiPickersUtilsProvider>

        <TextField
          error={errors && errors.description}
          helperText={helperText.description}
          className={classes.formField}
          id="note-description"
          label="Description"
          name="description"
          multiline={true}
          rows="5"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={inputs.description || ''}
          required
        />
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <Button
              size="small"
              label="Cancel"
              primary="true"
              onClick={handleClose}
              className={classes.cancelButton}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              type="submit"
              label="Save"
              className={classes.cancelButton}
              variant="contained"
              disableElevation
              color="primary"
              primary="true"
              onClick={handleSubmit}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
}

AddNote.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  library: PropTypes.object,
};

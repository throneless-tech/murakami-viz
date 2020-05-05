import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  cancelButton: {
    marginTop: "30px",
  },
  dialogTitleRoot: {
    marginTop: "30px",
  },
  dialogTitleText: {
    fontSize: "2.25rem",
    textAlign: "right"
  },
  form: {
    padding: "50px",
  },
  formField: {
    marginBottom: "30px",
  }
}))

export default function AddNote(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  return (
    <Dialog onClose={handleClose} modal={true} open={open} aria-labelledby="add-note-title" fullWidth={ true } maxWidth={"lg"}>
      <Grid container spacing={2} alignItems="center" justify="center">
        <Grid item xs={12} sm={7}>
          <DialogTitle id="add-note-title" className={classes.dialogTitleRoot}>
            <div className={classes.dialogTitleText}>Add a Note</div>
          </DialogTitle>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Button size="small" label="Cancel" primary={true} onClick={handleClose} className={classes.cancelButton}>
            Cancel
          </Button>
        </Grid>
      </Grid>
      <form action="/" method="POST" className={classes.form} onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); this.handleClose(); } }>
        <TextField
          className={classes.formField}
          id="note-subject"
          label="Subject"
          fullWidth
          variant="outlined"
        />
        <div className={classes.formField}>
          <TextField
            id="note-date"
            label="Date"
            type="date"
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            id="time"
            label="Time"
            type="time"
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
        <TextField
          className={classes.formField}
          id="note-description"
          label="Description"
          multiline="true"
          rows="5"
          fullWidth
          variant="outlined"
        />
        <Button type="submit" label="Save" className={classes.formField}  variant="contained" primary={true}>
          Save
        </Button>
      </form>
    </Dialog>
  );
}

AddNote.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};

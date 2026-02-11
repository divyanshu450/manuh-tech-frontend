import logo from './logo.svg';
import './App.css';
import { Alert, Box, CircularProgress, Container, Paper, Snackbar, Table, TableHead, TextField, Typography } from '@mui/material';
import { use, useState } from 'react';
import { Button, FormControl, IconButton, InputLabel, MenuItem, Select, TableBody, TableCell, TableRow } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import api from './api/axios';
import { useEffect } from 'react';


function App() {
  const [ members, setMembers ] = useState([]);
  const [ selectedMember, setSelectedMember ] = useState("");
  const [ workouts, setWorkouts ] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ message, setMessage ] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    exercise: "",
    sets: "",
    reps: "",
    weight: "",
    notes: ""
  });
  const [editingId, setEditingId] = useState(null);

  //fetch members on load
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get("/members");
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  //fetch workouts when member changes
  useEffect(() => {
    if (selectedMember) {
      fetchWorkouts();
    }
  }, [selectedMember]);

  const fetchWorkouts = async (memberId) => {
    setLoading(true);
    try {
      const res = await api.get(`/workout?memberId=${memberId}`);
      setWorkouts(res.data);
    }catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  //handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

//add or update workout
const handleSubmit = async () => {
  if(!selectedMember) return;
  try {
    const payload = { 
      memberId: selectedMember,
      date: formData.date,
      exerciseName: formData.exerciseName,
      sets: formData.sets,
      reps: formData.reps,
      weight: formData.weight,
      notes: formData.notes
    };
    if (editingId) {
      await api.put(`/workouts/${editingId}`, payload);
      setMessage("Workout updated successfully!");
    }
    else{
      await api.post("/workouts", payload);
      setMessage("Workout added successfully!");
    }
    requestFormReset();
    fetchWorkouts(selectedMember);
  } catch (err) {
    console.error(err);
  }
}

//delete workout
const handleDelete = async (id) => {
  try {
    await api.delete(`/workouts/${id}`);
    setMessage("Workout deleted successfully!");
    fetchWorkouts(selectedMember);
  } catch (err) {
    console.error(err);
  }
}

//edit workout
const handleEdit = (workout) => {
  setEditingId(workout.id);
  setFormData({
    date: workout.date,
    exerciseName: workout.exercise,
    sets: workout.sets,
    reps: workout.reps,
    weight: workout.weight || "",
    notes: workout.notes || ""
  });
}

const requestFormReset = () => {
  setEditingId(null);
  setFormData({
    date: "",
    exerciseName: "",
    sets: "",
    reps: "",
    weight: "",
    notes: ""
  });
}
     

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Gym Workout Tracker
      </Typography>
      <Typography variant="body1">
        Welcome to the Workout Tracker! Please select a member to view their workouts.
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="member-select-label">Select Member</InputLabel>
        <Select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} labelId="member-select-label" label="Select Member">
          {members.map((member) => (
            <MenuItem key={member.id} value={member.id}>
              {member.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* FORM */}
      {selectedMember && (
        <Paper elevation={3} style={{ padding: 20, marginTop: 20 }}>
          <Typography variant="h5" gutterBottom>
           {editingId ? "Edit Workout" : "Add Workout"}
          </Typography>
          <Box sx={{ display: 'grid', flexDirection: 'column', gap: 2 }}>
            <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            <TextField label="Exercise" fullWidth value={formData.exerciseName} onChange={(e) => setFormData({ ...formData, exerciseName: e.target.value })} />
            <TextField label="Sets" type="number" fullWidth value={formData.sets} onChange={(e) => setFormData({ ...formData, sets: e.target.value })} />
            <TextField label="Reps" type="number" fullWidth value={formData.reps} onChange={(e) => setFormData({ ...formData, reps: e.target.value })} />
            <TextField label="Weight" type="number" fullWidth value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
            <TextField label="Notes" fullWidth multiline rows={4} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                {editingId ? "Update Workout" : "Add Workout"}
                </Button>
                {editingId && (
                  <Button variant="outlined" color="secondary" onClick={() => { setEditingId(null); setFormData({ date: "", exerciseName: "", sets: "", reps: "", weight: "", notes: "" }); }}>
                    Cancel
                  </Button>
                )}
            </Box>
          </Box>
          </Paper>
      )}

      {/* WORKOUTS TABLE */}
      {loading ? (
        <CircularProgress />
      ) : (
        selectedMember && (
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Exercise</TableCell>
                  <TableCell>Sets</TableCell>
                  <TableCell>Reps</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {workouts.map((workout) => (
                  <TableRow key={workout.id}>
                    <TableCell>{workout.date}</TableCell>
                    <TableCell>{workout.exercise}</TableCell>
                    <TableCell>{workout.sets}</TableCell>
                    <TableCell>{workout.reps}</TableCell>
                    <TableCell>{workout.weight || "-"}</TableCell>
                    <TableCell>{workout.notes || "-"}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEdit(workout)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDelete(workout.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )
      )}
      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage("")} message={message} >

      <Alert severity='success'>{message}</Alert>
      </Snackbar>

    </Container>
  );
}

export default App;





// import { useEffect, useState } from "react";
// import api from "./api/axios";

// function App() {
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     api.get("/hello")
//       .then(res => {
//         console.log("Axios response:", res); 
//         setMessage(res.data.message);
//       })
//       .catch(err => {
//         console.error(err);
//       });
//   }, []);

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Frontend</h1>
//       <p>Backend says: {message}</p>
//     </div>
//   );
// }

// export default App;
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "./style/admins.css";
import http from "./../../../../Helper/http";
import MainTabel from "../MainTabel/MainTabel";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { getAuthUser } from "../../../../Helper/Storage";
import { useDispatch } from "react-redux";
import { openToast } from "../../../../Redux/Slices/toastSlice";

const Admins = () => {
  const user = getAuthUser();
  const dispatch = useDispatch();
  const [loadingStates, setLoadingStates] = useState({});
  const [open, setOpen] = React.useState(false);
  const [reloadData, setReloadData] = useState(true);
  const [selectedRole, setSelectedRole] = useState("");
  const [openDeleteDilog, setOpenDeleteDilog] = useState({
    open: false,
    id: "",
  });
  const [openUpdateDilog, setOpenUpdateDilog] = useState({
    open: false,
    id: "",
  });
  const [deleteUser, setDeleteUser] = useState({
    loading: false,
  });
  const [users, setUsers] = useState({
    data: [],
    loading: false,
    errorMsg: "",
  });
  const [newAdmin, setNewAdmin] = useState({
    loading: false,
    errorMsg: "",
  });
  const [updateAmdin, setUpdateAmdin] = useState({
    loading: false,
    errorMsg: "",
  });

  //call all admins
  useEffect(() => {
    if (reloadData) {
      setUsers({ ...users, loading: true });

      http
        .GET(`users?role=admin&role=super admin`)
        .then((res) => {
          const localUsers = res?.data?.data?.data?.map((user) => ({
            ...user,
            name: user.firstName + " " + user.lastName,
          }));

          setUsers({ data: localUsers, loading: false, errorMsg: "" });
          setReloadData(false);
        })
        .catch((err) => {
          setUsers({
            ...users,
            loading: false,
            errorMsg: "Something went wrong!",
          });
        });
    }
  }, [reloadData]);

  //handel update user dialog
  const handleCloseUpdateDilog = () => {
    setOpenUpdateDilog({ open: false, id: "" });
    setUpdateAmdin((prevState) => ({
      ...prevState,
      errorMsg: "",
    }));
  };
  const handleClickOpenUpdateDilog = (id) => {
    setOpenUpdateDilog({ open: true, id: id });
    setUpdateAmdin((prevState) => ({
      ...prevState,
      errorMsg: "",
    }));
  };

  //handel delete user dilog

  const handleCloseDeleteDilog = () => {
    setOpenDeleteDilog({ open: false, id: "" });
  };
  const handleClickOpenDeleteDilog = (id) => {
    setOpenDeleteDilog({ open: true, id: id });
  };
  // handel delete user
  const handleDelete = () => {
    setDeleteUser({ ...deleteUser, loading: true });
    http
      .DELETE(`users/${openDeleteDilog.id}`)
      .then((res) => {
        setReloadData(true);
        setDeleteUser({
          ...deleteUser,
          loading: false,
        });
        handleCloseDeleteDilog();
        dispatch(
          openToast({
            msg: "Admin deleted successfully",
            type: "success",
          })
        );
      })

      .catch((err) => {
        setDeleteUser({
          ...deleteUser,
          loading: false,
        });
        handleCloseDeleteDilog();
        dispatch(
          openToast({
            msg: "Something went wrong",
            type: "error",
          })
        );
      });
  };

  // handel activation user
  const handelActivation = (id) => {
    setLoadingStates({ ...loadingStates, [id]: true });
    http
      .PATCH(`users/activate/${id}`)
      .then((res) => {
        setReloadData(true);
        setLoadingStates({ ...loadingStates, [id]: false });
        dispatch(
          openToast({
            msg: "Operation was completed successfully",
            type: "success",
          })
        );
      })
      .catch((err) => {
        setLoadingStates({ ...loadingStates, [id]: false });
        dispatch(
          openToast({
            msg: "Something went wrong",
            type: "error",
          })
        );
      });
  };

  // table column and options

  const columns = [
    {
      name: "photo",
      label: "Image",
      options: {
        customBodyRender: (value, tableMeta) => {
          const userImg = users.data[tableMeta.rowIndex]?.file;
          return (
            <div
              className="user-table-img"
              style={{
                backgroundImage: `url(${userImg})`,
              }}
            ></div>
          );
        },
      },
    },
    {
      name: "name",
    },
    {
      name: "email",
    },
    {
      name: "role",
    },
    {
      name: "active",
      options: {
        customBodyRender: (value, tableMeta) => {
          const userId = users.data[tableMeta.rowIndex]?._id;
          const isLoading = loadingStates[userId];
          const role = users.data[tableMeta.rowIndex]?.role;

          let status;
          if (isLoading) {
            status = <CircularProgress size={20} color="inherit" />;
          } else {
            status = value ? "Activated" : "Inactive";
          }

          return (
            <button
              onClick={() => handelActivation(userId)}
              disabled={
                (user?.data.data.user.role !== "super admin" &&
                  role === "super admin") ||
                isLoading
              }
              className={value ? " main-btn sm update" : " main-btn sm delete"}
            >
              {status}
            </button>
          );
        },
      },
    },

    {
      name: "action",
      options: {
        customBodyRender: (value, tableMeta) => {
          const userId = users.data[tableMeta.rowIndex]?._id;
          const role = users.data[tableMeta.rowIndex]?.role;

          return (
            <div className="actions-btns">
              <button
                className="main-btn sm delete"
                onClick={() => {
                  handleClickOpenDeleteDilog(userId);
                }}
                disabled={
                  user?.data.data.user.role !== "super admin" &&
                  role === "super admin"
                }
              >
                Delete
              </button>
              <button
                className="main-btn sm update"
                onClick={() => {
                  handleClickOpenUpdateDilog(userId);
                }}
                disabled={
                  user?.data.data.user.role !== "super admin" &&
                  role === "super admin"
                }
              >
                Update
              </button>
            </div>
          );
        },
      },
    },
  ];
  const options = {
    customToolbar: () => (
      <Tooltip title="Add Admin">
        <IconButton onClick={handleClickOpen}>
          <AddIcon />
        </IconButton>
      </Tooltip>
    ),
    filterType: "multiselect",
    selectableRows: "none",
    elevation: 0,
    rowsPerPage: 7,
    rowsPerPageOptions: [7, 50, 100],
  };

  //handle open and close dilog add admin

  const handleClickOpen = () => {
    setNewAdmin((prevState) => ({
      ...prevState,
      errorMsg: "",
    }));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewAdmin((prevState) => ({
      ...prevState,
      errorMsg: "",
    }));
  };

  //add admin functoin
  const addAdmin = (data) => {
    setNewAdmin({ ...newAdmin, loading: true });
    http
      .POST("users/signup", data)
      .then((res) => {
        setNewAdmin({ ...newAdmin, loading: false });
        setReloadData(true);
        handleClose();
        dispatch(
          openToast({
            msg: "Admin added successfully",
            type: "success",
          })
        );
      })
      .catch((err) => {
        setNewAdmin({
          ...newAdmin,
          loading: false,
          errorMsg: err?.response?.data?.message,
        });
        dispatch(
          openToast({
            msg: "Something went wrong",
            type: "error",
          })
        );
      });
  };
  // handel update user
  const updateUser = (data) => {
    setUpdateAmdin({ ...updateAmdin, loading: true });

    http
      .PATCH(`users/${openUpdateDilog.id}`, data)
      .then((res) => {
        setUpdateAmdin({
          ...updateAmdin,
          loading: false,
          errorMsg: "",
        });
        setReloadData(true);
        handleCloseUpdateDilog();
        dispatch(
          openToast({
            msg: "Admin updated successfully",
            type: "success",
          })
        );
      })
      .catch((err) => {
        setUpdateAmdin({
          ...updateAmdin,
          loading: false,
          errorMsg: "Please enter valid data",
        });
        dispatch(
          openToast({
            msg: "Something went wrong",
            type: "error",
          })
        );
      });
  };

  return (
    <section className="admin-admins-section">
      <div className="container">
        {users.errorMsg !== "" && (
          <Alert severity="error">{users.errorMsg}</Alert>
        )}
        {users.data.length === 0 &&
          users.errorMsg === "" &&
          users.loading === false && (
            <>
              <Alert severity="info">No Admins Found</Alert>
              <MainTabel
                title={"Admins"}
                data={users.data}
                columns={columns}
                customOptions={options}
              />
            </>
          )}
        {users.data.length > 0 &&
          users.errorMsg === "" &&
          users.loading === false && (
            <MainTabel
              title={"Admins"}
              data={users.data}
              columns={columns}
              customOptions={options}
            />
          )}
        {users.data.length === 0 &&
          users.errorMsg === "" &&
          users.loading === true && (
            <CircularProgress
              sx={{
                margin: "auto",
                display: "block",
              }}
              size={60}
              color="inherit"
            />
          )}
        {users.data.length > 0 &&
          users.errorMsg === "" &&
          users.loading === true && (
            <CircularProgress
              sx={{
                margin: "auto",
                display: "block",
              }}
              size={60}
              color="inherit"
            />
          )}
      </div>
      {/* update dialog */}
      <Dialog
        open={openUpdateDilog.open}
        onClose={handleCloseUpdateDilog}
        fullWidth
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            formJson.role = selectedRole;
            const filteredObj = Object.fromEntries(
              Object.entries(formJson).filter(([key, value]) => value !== "")
            );
            if (Object.keys(filteredObj).length === 0) {
              setUpdateAmdin((prevState) => ({
                ...prevState,
                errorMsg: "You must enter valid data to update",
              }));
            } else {
              updateAmdin.errorMsg = "";
              updateUser(filteredObj);
            }
          },
        }}
      >
        <DialogTitle>Update Admin</DialogTitle>
        <DialogContent>
          {updateAmdin.errorMsg !== "" && (
            <Alert severity="error">{updateAmdin.errorMsg}</Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="firstName"
            label="First Name"
            type="text"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            id="name"
            name="lastName"
            label="Last Name"
            type="text"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            id="name"
            name="phone"
            label="Phone Number"
            type="text"
            fullWidth
            variant="outlined"
          />
          <FormControl fullWidth variant="standard" margin="dense">
            <InputLabel htmlFor="role">Role</InputLabel>
            <Select
              id="role"
              name="role"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="instructor">Instructor</MenuItem>
              {user?.data.data.user.role === "super admin" && (
                <MenuItem value="super admin">super admin</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCloseUpdateDilog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            color="success"
            disabled={updateAmdin.loading}
          >
            {updateAmdin.loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "update"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      {/* add admin dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const filteredObj = Object.fromEntries(
              Object.entries(formJson).filter(([key, value]) => value !== "")
            );
            if (Object.keys(filteredObj).length === 0) {
              setNewAdmin((prevState) => ({
                ...prevState,
                errorMsg: "You must enter data to add new admin",
              }));
            } else {
              newAdmin.errorMsg = "";
              formJson.role = "admin";
              addAdmin(formJson);
            }
          },
        }}
      >
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogContent>
          {newAdmin.errorMsg !== "" && (
            <Alert severity="error">{newAdmin.errorMsg}</Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="firstName"
            label="First Name"
            type="text"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            id="name"
            name="lastName"
            label="Last Name"
            type="text"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            id="name"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            id="name"
            name="phone"
            label="Phone Number"
            type="text"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            id="name"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            id="name"
            name="passwordConfirm"
            label="Confirm Password"
            type="password"
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            color="success"
            disabled={newAdmin.loading}
          >
            {newAdmin.loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Add"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      {/* delete admin dialog */}
      <Dialog
        fullWidth
        open={openDeleteDilog.open}
        onClose={handleCloseDeleteDilog}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {"Do you want to delete this user?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            If you delete this user, you will not be able to recover it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCloseDeleteDilog}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            disabled={deleteUser.loading}
            color="error"
          >
            {deleteUser.loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};

export default Admins;

import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Paper } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FieldValues, useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import agent from "../api/agent";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import LoadingComponent from "../components/LoadingComponent/LoadingComponent";
import { LoginContext } from "../context/LoginContext";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const { setUserId, userId, setUserName } = useContext(LoginContext);

  const navigation = useNavigate();
  const location = useLocation();
  const state = location.state as { from: Location; redirectTo: string } | null;
  const redirectTo = state?.redirectTo || "/";

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = useForm({ mode: "onTouched" });

  const submitForm = async (data: FieldValues) => {
    setIsLoading(true);
    try {
      const response = await agent.Users.loginUser(data);

      console.log(response);

      localStorage.setItem("username-eshop", response.user.first_name);
      localStorage.setItem("userId-eshop", response.user.pk);
      setUserName(response.user.first_name);

      setLoggedUser(response);
      setUserId(response.user.pk);
      toast.success(response.message || "Login Successful");
      navigation(redirectTo, { replace: true });
    } catch (error: any) {
      if (error.response.data.email) toast.error(error.response.data.email[0]);
      if (error.response.data.non_field_errors) toast.error(error.response.data.non_field_errors[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      const tokens = await axios.post("http://localhost:8000/api/auth/google/connect/", {
        code: codeResponse.code,
      });

      console.log("tokens", tokens);

      setUserName(tokens.data.user.first_name);
      setUserId(tokens.data.user.pk);
      localStorage.setItem("username-eshop", tokens.data.user.first_name);
      localStorage.setItem("userId-eshop", tokens.data.user.pk);
      toast.success("Login Successful");
      navigation("/");
    },
    onError: async (errorResponse) => {
      console.log("error", errorResponse);
    },
  });

  if (isLoading) {
    return <LoadingComponent message="Logging In" />;
  }

  return (
    <Container
      component={Paper}
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
        mt: 3,
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: "warning.main" }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Log in
      </Typography>
      <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          label="Email"
          {...register("email", { required: "email is required" })}
          error={!!errors.email}
          helperText={errors?.email?.message as string}
          autoComplete="current-email"
        />
        <TextField
          margin="normal"
          fullWidth
          label="Password"
          type="password"
          {...register("password", { required: "Password is required" })}
          error={!!errors.password}
          helperText={errors?.password?.message as string}
          autoComplete="current-password"
        />
        <LoadingButton
          disabled={!isValid || loggedUser != null}
          loading={isSubmitting}
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          {userId === null ? "Sing In" : "You Already Logged In"}
        </LoadingButton>
        <Box display="flex" justifyContent="center" sx={{ mb: 2, mt: 1, width: "100%" }}>
          <GoogleLogin onSuccess={handleGoogleLoginSuccess} size="large" shape="pill" />
        </Box>
        <Grid container>
          <Grid item>
            <Link to="/Register">{"Don't have an account? Sign Up"}</Link>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

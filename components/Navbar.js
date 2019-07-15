import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ShareOutlined from "@material-ui/icons/ShareOutlined";
import withStyles from "@material-ui/core/styles/withStyles";
import ActiveLink from "./ActiveLink";
import {signOut} from "../lib/auth";

const Navbar = ({ classes, router, pageProps: { auth } }) => {
  const { user = {} } = auth || {};
  const position = router.pathname === "/" ? "fixed" : "static";
  return (
    <AppBar className={classes.appBar} position={position}>
      <Toolbar>
        <ActiveLink href="/">
          <ShareOutlined className={classes.icon} />
        </ActiveLink>
        <Typography
          variant="h5"
          component="h1"
          className={classes.toolbarTitle}
        >
          <ActiveLink href="/">Next Social App</ActiveLink>
        </Typography>
        {user._id ? (
          <div>
            <Button>
              <ActiveLink href={`/profile/${user._id}`}>Profile</ActiveLink>
            </Button>
            <Button variant="outlined" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div>
            <Button>
              <ActiveLink href="/signin">Sign In</ActiveLink>
            </Button>
            <Button>
              <ActiveLink href="/signup">Sign Up</ActiveLink>
            </Button>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

const styles = theme => ({
  appBar: {
    // z-index 1 higher than the fixed drawer in home page to clip it under the navigation
    zIndex: theme.zIndex.drawer + 1
  },
  toolbarTitle: {
    flex: 1
  },
  icon: {
    marginRight: theme.spacing.unit
  }
});

export default withStyles(styles)(Navbar);

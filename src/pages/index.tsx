export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Hello, this is Code comment generator app
    </main>
  )
}

// {firebaseUserDataLoaded && (
//   <>
//     <PrivateRoute path="/invite/:roomId" component={InviteToRoom} exact />
//     <PrivateRoute exact path="/" component={ChatScreen} />
//     <PrivateRoute exact path="/m/:roomId" component={ChatScreen} />
//     <PrivateRoute exact path="/logout" component={Logout} />
//     <PublicRoute restricted path="/sign-in" component={Login} />
//   </>
// )}
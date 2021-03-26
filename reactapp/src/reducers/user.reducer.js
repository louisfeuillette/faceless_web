// reducers qui fait passer le token dans le store
export default function (user = "", action) {
    if (action.type === "ADD_USER") {
        var newInfo = action.payload;
        // console.log(newInfo, "<------ user on store");
        return newInfo;
    } else {
        return user;
    }
}

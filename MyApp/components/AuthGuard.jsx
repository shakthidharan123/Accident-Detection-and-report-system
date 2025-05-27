import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const AuthGuard = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                router.replace("/app/(auth)/navigtor"); // Redirect to login if no token
            } else {
                setIsAuthenticated(true);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    if (loading) return <View><ActivityIndicator size="large" /></View>;

    return isAuthenticated ? children : null;
};

export default AuthGuard;

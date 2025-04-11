import React from 'react';
import { View, Text, StyleSheet, Button, Platform } from 'react-native';

class ErrorFallback extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error("App Error:", error);
    console.error("Error Details:", errorInfo);
    
    // Update state to show fallback UI
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <View style={styles.container}>
          <Text style={styles.header}>Something went wrong</Text>
          <Text style={styles.details}>
            Platform: {Platform.OS} {Platform.Version}
          </Text>
          <Text style={styles.errorMessage}>
            {this.state.error && this.state.error.toString()}
          </Text>
          <Button
            title="Try Again"
            onPress={() => this.setState({ error: null, errorInfo: null })}
          />
        </View>
      );
    }
    
    // Normally, just render children
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: 'red',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
});

export default ErrorFallback; 
import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const FilterByName = ({ 
  onSearch, 
  placeholder = "Search by name...",
  debounceTime = 500,
  minSearchLength = 2,
  showClearButton = true,
  className = "",
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    if (searchTerm.length < minSearchLength) {
      setDebouncedTerm('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceTime, minSearchLength]);

  // Trigger search when debounced term changes
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedTerm);
    }
  }, [debouncedTerm, onSearch]);

  // Clear search
  const handleClear = () => {
    setSearchTerm('');
    setDebouncedTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <View className={`flex-row items-center bg-white rounded-lg shadow-sm px-3 py-2 ${className}`}>
      {/* Search Icon */}
      <FontAwesome6 
        name="magnifying-glass" 
        size={16} 
        color="#666"
        className="mr-2"
      />

      {/* Search Input */}
      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder={placeholder}
        placeholderTextColor="#999"
        className="flex-1 text-base text-gray-800"
      />

      {/* Loading Indicator */}
      {loading && (
        <ActivityIndicator 
          size="small" 
          color="#5750F1"
          className="ml-2"
        />
      )}

      {/* Clear Button */}
      {showClearButton && searchTerm.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          className="ml-2 p-1"
          activeOpacity={0.7}
        >
          <FontAwesome6 
            name="xmark" 
            size={16} 
            color="#666"
          />
        </TouchableOpacity>
      )}

      {/* Min Length Indicator */}
      {searchTerm.length > 0 && searchTerm.length < minSearchLength && (
        <View className="absolute -bottom-6 left-0 right-0">
          <Text className="text-xs text-gray-500 text-center">
            Enter at least {minSearchLength} characters to search
          </Text>
        </View>
      )}
    </View>
  );
};

export default FilterByName; 
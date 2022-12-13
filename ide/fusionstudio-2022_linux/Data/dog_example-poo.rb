# Example script for OpenStudio 1.2
# Gabriel Margarido - March, 2021

class Dog
	# Defines a structure of a dog.
	def bark
		puts "whoof!"
	end

end

class Program
	husky = Dog.new # Creates a new dog named "husky"
	inst = gets 	# Get information from use keyboard


	# Test if the instruction is to bark or not.
	if (inst == "bark") then
		husky.bark
	else
		puts "Try another instruction!"
	end

end
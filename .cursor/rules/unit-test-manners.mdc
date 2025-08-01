---
alwaysApply: true
---
# Unit Test Manners: Decoupling for Testability

When implementing unit tests, adhere to the following principles to ensure robust, maintainable, and fast tests:

1. **Avoid Mocks and Patches for External Dependencies:**
    * Do not rely on mocks or patches, especially for methods or functions that involve external interactions such as network requests, database calls, or file system operations.
    * Such tests often become brittle, difficult to maintain, and can give a false sense of security, as they test the interaction with a mocked dependency rather than the actual behavior of the system under test when integrated with real dependencies.

2. **Decouple Methods and Functions:**
    * Design your methods and functions to be as decoupled as possible from external dependencies.
    * Focus on creating "pure" functions or components with clear inputs and deterministic outputs, allowing them to be tested in isolation without the need for network requests or other I/O operations.
    * Consider patterns such as "functional core, imperative shell" or "Hexagonal Architecture" to separate business logic from infrastructure concerns.
    * For infrastructure components that still require testing, explore techniques like "Nullables" where production code includes an "off" switch for dependencies or mechanisms to track output for state-based assertions, as discussed in "Testing Without Mocks: A Pattern Language" by James Shore [https://www.jamesshore.com/v2/blog/2018/testing-without-mocks].

By following these guidelines, you can write unit tests that are reliable, fast, and accurately reflect the behavior of your code.

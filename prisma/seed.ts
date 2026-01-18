import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

interface TestCaseData {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

interface BugData {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  type: string; // logic, performance, security, edge_case
  language: string;
  buggyCode: string;
  correctCode: string;
  hint: string;
  explanation: string;
  xpReward: number;
  testCases: TestCaseData[];
}

interface ChallengeData {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  xpReward: number;
  constraints: string;
  examples: { input: string; output: string; explanation?: string }[];
  hints: string[];
  starterCode: Record<string, string>;
  solutions: Record<string, string>;
  testCases: TestCaseData[];
  timeComplexity?: string;
  spaceComplexity?: string;
  architectInsight?: string;
}

const challenges: ChallengeData[] = [
  // Easy Challenges (7)
  {
    slug: "two-sum",
    title: "Two Sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: "easy",
    category: "Arrays",
    xpReward: 10,
    constraints: `- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ],
    hints: [
      "Think about what information you need to store as you iterate through the array.",
      "A hash map can help you look up values in O(1) time.",
      "For each number, check if (target - number) exists in your hash map.",
    ],
    starterCode: {
      javascript: `function solution(nums, target) {
  // Your code here
}`,
      python: `def solution(nums, target):
    # Your code here
    pass`,
      typescript: `function solution(nums: number[], target: number): number[] {
  // Your code here
}`,
    },
    solutions: {
      javascript: `function solution(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
}`,
      python: `def solution(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    architectInsight: "This is a classic example of trading space for time. By using a hash map, we reduce the time complexity from O(n²) to O(n).",
    testCases: [
      { id: "tc1", input: "[[2,7,11,15], 9]", expectedOutput: "[0,1]", isHidden: false },
      { id: "tc2", input: "[[3,2,4], 6]", expectedOutput: "[1,2]", isHidden: false },
      { id: "tc3", input: "[[3,3], 6]", expectedOutput: "[0,1]", isHidden: false },
      { id: "tc4", input: "[[1,2,3,4,5], 9]", expectedOutput: "[3,4]", isHidden: true },
      { id: "tc5", input: "[[-1,-2,-3,-4,-5], -8]", expectedOutput: "[2,4]", isHidden: true },
    ],
  },
  {
    slug: "reverse-string",
    title: "Reverse String",
    description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    difficulty: "easy",
    category: "Strings",
    xpReward: 10,
    constraints: `- 1 <= s.length <= 10^5
- s[i] is a printable ascii character.`,
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
    ],
    hints: [
      "Use two pointers, one at the start and one at the end.",
      "Swap characters and move pointers toward the center.",
      "Continue until the pointers meet in the middle.",
    ],
    starterCode: {
      javascript: `function solution(s) {
  // Your code here
}`,
      python: `def solution(s):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(s) {
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }

  return s;
}`,
      python: `def solution(s):
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
    return s`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    testCases: [
      { id: "tc1", input: '"hello"', expectedOutput: '"olleh"', isHidden: false },
      { id: "tc2", input: '"Hannah"', expectedOutput: '"hannaH"', isHidden: false },
      { id: "tc3", input: '"a"', expectedOutput: '"a"', isHidden: false },
      { id: "tc4", input: '"ab"', expectedOutput: '"ba"', isHidden: true },
      { id: "tc5", input: '"racecar"', expectedOutput: '"racecar"', isHidden: true },
    ],
  },
  {
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    difficulty: "easy",
    category: "Strings",
    xpReward: 10,
    constraints: `- 1 <= s.length <= 2 * 10^5
- s consists only of printable ASCII characters.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: "false", explanation: '"raceacar" is not a palindrome.' },
      { input: 's = " "', output: "true", explanation: "s is an empty string after removing non-alphanumeric characters." },
    ],
    hints: [
      "First, clean the string by removing non-alphanumeric characters and converting to lowercase.",
      "Use two pointers to compare characters from both ends.",
      "Alternatively, compare the cleaned string with its reverse.",
    ],
    starterCode: {
      javascript: `function solution(s) {
  // Your code here
}`,
      python: `def solution(s):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}`,
      python: `def solution(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    testCases: [
      { id: "tc1", input: '"A man, a plan, a canal: Panama"', expectedOutput: "true", isHidden: false },
      { id: "tc2", input: '"race a car"', expectedOutput: "false", isHidden: false },
      { id: "tc3", input: '" "', expectedOutput: "true", isHidden: false },
      { id: "tc4", input: '"Was it a car or a cat I saw?"', expectedOutput: "true", isHidden: true },
      { id: "tc5", input: '"0P"', expectedOutput: "false", isHidden: true },
    ],
  },
  {
    slug: "maximum-subarray",
    title: "Maximum Subarray",
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    difficulty: "easy",
    category: "Arrays",
    xpReward: 10,
    constraints: `- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1", explanation: "The subarray [1] has the largest sum 1." },
      { input: "nums = [5,4,-1,7,8]", output: "23", explanation: "The subarray [5,4,-1,7,8] has the largest sum 23." },
    ],
    hints: [
      "Think about Kadane's algorithm.",
      "At each position, decide whether to extend the previous subarray or start fresh.",
      "Keep track of the maximum sum seen so far.",
    ],
    starterCode: {
      javascript: `function solution(nums) {
  // Your code here
}`,
      python: `def solution(nums):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}`,
      python: `def solution(nums):
    max_sum = current_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    architectInsight: "Kadane's algorithm is a classic dynamic programming solution that processes the array in a single pass.",
    testCases: [
      { id: "tc1", input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6", isHidden: false },
      { id: "tc2", input: "[1]", expectedOutput: "1", isHidden: false },
      { id: "tc3", input: "[5,4,-1,7,8]", expectedOutput: "23", isHidden: false },
      { id: "tc4", input: "[-1]", expectedOutput: "-1", isHidden: true },
      { id: "tc5", input: "[-2,-1]", expectedOutput: "-1", isHidden: true },
    ],
  },
  {
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.`,
    difficulty: "easy",
    category: "Arrays",
    xpReward: 10,
    constraints: `- 1 <= nums.length <= 10^5
- -10^9 <= nums[i] <= 10^9`,
    examples: [
      { input: "nums = [1,2,3,1]", output: "true", explanation: "1 appears twice." },
      { input: "nums = [1,2,3,4]", output: "false", explanation: "All elements are distinct." },
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true" },
    ],
    hints: [
      "A Set automatically handles duplicate detection.",
      "Compare the Set size with the array length.",
      "Alternatively, iterate and check if an element was seen before.",
    ],
    starterCode: {
      javascript: `function solution(nums) {
  // Your code here
}`,
      python: `def solution(nums):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(nums) {
  const seen = new Set();

  for (const num of nums) {
    if (seen.has(num)) {
      return true;
    }
    seen.add(num);
  }

  return false;
}`,
      python: `def solution(nums):
    return len(nums) != len(set(nums))`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    testCases: [
      { id: "tc1", input: "[1,2,3,1]", expectedOutput: "true", isHidden: false },
      { id: "tc2", input: "[1,2,3,4]", expectedOutput: "false", isHidden: false },
      { id: "tc3", input: "[1,1,1,3,3,4,3,2,4,2]", expectedOutput: "true", isHidden: false },
      { id: "tc4", input: "[1]", expectedOutput: "false", isHidden: true },
      { id: "tc5", input: "[0,0]", expectedOutput: "true", isHidden: true },
    ],
  },
  {
    slug: "best-time-to-buy-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`ith\` day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    difficulty: "easy",
    category: "Arrays",
    xpReward: 10,
    constraints: `- 1 <= prices.length <= 10^5
- 0 <= prices[i] <= 10^4`,
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "In this case, no transactions are done and the max profit = 0." },
    ],
    hints: [
      "Track the minimum price seen so far.",
      "At each day, calculate the profit if you sell today.",
      "Keep track of the maximum profit.",
    ],
    starterCode: {
      javascript: `function solution(prices) {
  // Your code here
}`,
      python: `def solution(prices):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;

  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }

  return maxProfit;
}`,
      python: `def solution(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    testCases: [
      { id: "tc1", input: "[7,1,5,3,6,4]", expectedOutput: "5", isHidden: false },
      { id: "tc2", input: "[7,6,4,3,1]", expectedOutput: "0", isHidden: false },
      { id: "tc3", input: "[2,4,1]", expectedOutput: "2", isHidden: false },
      { id: "tc4", input: "[1,2]", expectedOutput: "1", isHidden: true },
      { id: "tc5", input: "[3,2,6,5,0,3]", expectedOutput: "4", isHidden: true },
    ],
  },
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    difficulty: "easy",
    category: "Strings",
    xpReward: 10,
    constraints: `- 1 <= s.length, t.length <= 5 * 10^4
- s and t consist of lowercase English letters.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true" },
      { input: 's = "rat", t = "car"', output: "false" },
    ],
    hints: [
      "Two strings are anagrams if they have the same character frequencies.",
      "Use a hash map to count characters in the first string.",
      "Decrement counts while iterating through the second string.",
    ],
    starterCode: {
      javascript: `function solution(s, t) {
  // Your code here
}`,
      python: `def solution(s, t):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(s, t) {
  if (s.length !== t.length) return false;

  const count = {};

  for (const char of s) {
    count[char] = (count[char] || 0) + 1;
  }

  for (const char of t) {
    if (!count[char]) return false;
    count[char]--;
  }

  return true;
}`,
      python: `def solution(s, t):
    if len(s) != len(t):
        return False
    from collections import Counter
    return Counter(s) == Counter(t)`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    testCases: [
      { id: "tc1", input: '["anagram", "nagaram"]', expectedOutput: "true", isHidden: false },
      { id: "tc2", input: '["rat", "car"]', expectedOutput: "false", isHidden: false },
      { id: "tc3", input: '["a", "a"]', expectedOutput: "true", isHidden: false },
      { id: "tc4", input: '["ab", "ba"]', expectedOutput: "true", isHidden: true },
      { id: "tc5", input: '["aacc", "ccac"]', expectedOutput: "false", isHidden: true },
    ],
  },

  // Medium Challenges (8)
  {
    slug: "longest-substring-without-repeating",
    title: "Longest Substring Without Repeating Characters",
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    difficulty: "medium",
    category: "Strings",
    xpReward: 25,
    constraints: `- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces.`,
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with the length of 3.' },
    ],
    hints: [
      "Use a sliding window approach.",
      "Maintain a set of characters in the current window.",
      "When you find a duplicate, shrink the window from the left.",
    ],
    starterCode: {
      javascript: `function solution(s) {
  // Your code here
}`,
      python: `def solution(s):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(s) {
  const seen = new Map();
  let maxLen = 0;
  let start = 0;

  for (let end = 0; end < s.length; end++) {
    const char = s[end];

    if (seen.has(char) && seen.get(char) >= start) {
      start = seen.get(char) + 1;
    }

    seen.set(char, end);
    maxLen = Math.max(maxLen, end - start + 1);
  }

  return maxLen;
}`,
      python: `def solution(s):
    seen = {}
    max_len = start = 0
    for end, char in enumerate(s):
        if char in seen and seen[char] >= start:
            start = seen[char] + 1
        seen[char] = end
        max_len = max(max_len, end - start + 1)
    return max_len`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(min(m, n))",
    testCases: [
      { id: "tc1", input: '"abcabcbb"', expectedOutput: "3", isHidden: false },
      { id: "tc2", input: '"bbbbb"', expectedOutput: "1", isHidden: false },
      { id: "tc3", input: '"pwwkew"', expectedOutput: "3", isHidden: false },
      { id: "tc4", input: '""', expectedOutput: "0", isHidden: true },
      { id: "tc5", input: '"dvdf"', expectedOutput: "3", isHidden: true },
    ],
  },
  {
    slug: "3sum",
    title: "3Sum",
    description: `Given an integer array nums, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
    difficulty: "medium",
    category: "Arrays",
    xpReward: 25,
    constraints: `- 3 <= nums.length <= 3000
- -10^5 <= nums[i] <= 10^5`,
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
      { input: "nums = [0,1,1]", output: "[]", explanation: "The only possible triplet does not sum to 0." },
      { input: "nums = [0,0,0]", output: "[[0,0,0]]" },
    ],
    hints: [
      "Sort the array first to easily skip duplicates.",
      "Fix one element and use two pointers for the other two.",
      "Skip duplicate values to avoid duplicate triplets.",
    ],
    starterCode: {
      javascript: `function solution(nums) {
  // Your code here
}`,
      python: `def solution(nums):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}`,
      python: `def solution(nums):
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i-1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left+1]:
                    left += 1
                while left < right and nums[right] == nums[right-1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    return result`,
    },
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    testCases: [
      { id: "tc1", input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]", isHidden: false },
      { id: "tc2", input: "[0,1,1]", expectedOutput: "[]", isHidden: false },
      { id: "tc3", input: "[0,0,0]", expectedOutput: "[[0,0,0]]", isHidden: false },
      { id: "tc4", input: "[-2,0,1,1,2]", expectedOutput: "[[-2,0,2],[-2,1,1]]", isHidden: true },
      { id: "tc5", input: "[]", expectedOutput: "[]", isHidden: true },
    ],
  },
  {
    slug: "group-anagrams",
    title: "Group Anagrams",
    description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    difficulty: "medium",
    category: "Hash Map",
    xpReward: 25,
    constraints: `- 1 <= strs.length <= 10^4
- 0 <= strs[i].length <= 100
- strs[i] consists of lowercase English letters.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    hints: [
      "Anagrams have the same sorted character sequence.",
      "Use a hash map with sorted string as key.",
      "Group all strings with the same key together.",
    ],
    starterCode: {
      javascript: `function solution(strs) {
  // Your code here
}`,
      python: `def solution(strs):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(strs) {
  const map = new Map();

  for (const str of strs) {
    const key = str.split('').sort().join('');
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(str);
  }

  return Array.from(map.values());
}`,
      python: `def solution(strs):
    from collections import defaultdict
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        groups[key].append(s)
    return list(groups.values())`,
    },
    timeComplexity: "O(n * k log k)",
    spaceComplexity: "O(n * k)",
    testCases: [
      { id: "tc1", input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]', isHidden: false },
      { id: "tc2", input: '[""]', expectedOutput: '[[""]]', isHidden: false },
      { id: "tc3", input: '["a"]', expectedOutput: '[["a"]]', isHidden: false },
      { id: "tc4", input: '["cab","tin","pew","duh","may","ill","buy","bar","max","doc"]', expectedOutput: '[["cab"],["tin"],["pew"],["duh"],["may"],["ill"],["buy"],["bar"],["max"],["doc"]]', isHidden: true },
    ],
  },
  {
    slug: "product-of-array-except-self",
    title: "Product of Array Except Self",
    description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operation.`,
    difficulty: "medium",
    category: "Arrays",
    xpReward: 25,
    constraints: `- 2 <= nums.length <= 10^5
- -30 <= nums[i] <= 30
- The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.`,
    examples: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
    ],
    hints: [
      "Think about prefix and suffix products.",
      "For each position, the answer is prefix_product * suffix_product.",
      "You can compute this in two passes.",
    ],
    starterCode: {
      javascript: `function solution(nums) {
  // Your code here
}`,
      python: `def solution(nums):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(nums) {
  const n = nums.length;
  const result = new Array(n).fill(1);

  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }

  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }

  return result;
}`,
      python: `def solution(nums):
    n = len(nums)
    result = [1] * n

    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]

    suffix = 1
    for i in range(n - 1, -1, -1):
        result[i] *= suffix
        suffix *= nums[i]

    return result`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    testCases: [
      { id: "tc1", input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]", isHidden: false },
      { id: "tc2", input: "[-1,1,0,-3,3]", expectedOutput: "[0,0,9,0,0]", isHidden: false },
      { id: "tc3", input: "[2,3]", expectedOutput: "[3,2]", isHidden: false },
      { id: "tc4", input: "[0,0]", expectedOutput: "[0,0]", isHidden: true },
      { id: "tc5", input: "[1,2,3,4,5]", expectedOutput: "[120,60,40,30,24]", isHidden: true },
    ],
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: "medium",
    category: "Stack",
    xpReward: 25,
    constraints: `- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'.`,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    hints: [
      "Use a stack to track opening brackets.",
      "When you see a closing bracket, check if it matches the top of the stack.",
      "The string is valid if the stack is empty at the end.",
    ],
    starterCode: {
      javascript: `function solution(s) {
  // Your code here
}`,
      python: `def solution(s):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(s) {
  const stack = [];
  const pairs = { ')': '(', '}': '{', ']': '[' };

  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.length === 0 || stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}`,
      python: `def solution(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in '([{':
            stack.append(char)
        else:
            if not stack or stack.pop() != pairs[char]:
                return False
    return len(stack) == 0`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    testCases: [
      { id: "tc1", input: '"()"', expectedOutput: "true", isHidden: false },
      { id: "tc2", input: '"()[]{}"', expectedOutput: "true", isHidden: false },
      { id: "tc3", input: '"(]"', expectedOutput: "false", isHidden: false },
      { id: "tc4", input: '"([)]"', expectedOutput: "false", isHidden: true },
      { id: "tc5", input: '"{[]}"', expectedOutput: "true", isHidden: true },
    ],
  },
  {
    slug: "merge-intervals",
    title: "Merge Intervals",
    description: `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    difficulty: "medium",
    category: "Arrays",
    xpReward: 25,
    constraints: `- 1 <= intervals.length <= 10^4
- intervals[i].length == 2
- 0 <= starti <= endi <= 10^4`,
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", explanation: "Intervals [1,4] and [4,5] are considered overlapping." },
    ],
    hints: [
      "Sort intervals by start time.",
      "Iterate through and merge overlapping intervals.",
      "Two intervals overlap if the second starts before the first ends.",
    ],
    starterCode: {
      javascript: `function solution(intervals) {
  // Your code here
}`,
      python: `def solution(intervals):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(intervals) {
  if (intervals.length <= 1) return intervals;

  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    const current = intervals[i];

    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      result.push(current);
    }
  }

  return result;
}`,
      python: `def solution(intervals):
    if len(intervals) <= 1:
        return intervals

    intervals.sort(key=lambda x: x[0])
    result = [intervals[0]]

    for start, end in intervals[1:]:
        if start <= result[-1][1]:
            result[-1][1] = max(result[-1][1], end)
        else:
            result.append([start, end])

    return result`,
    },
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    testCases: [
      { id: "tc1", input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]", isHidden: false },
      { id: "tc2", input: "[[1,4],[4,5]]", expectedOutput: "[[1,5]]", isHidden: false },
      { id: "tc3", input: "[[1,4],[0,4]]", expectedOutput: "[[0,4]]", isHidden: false },
      { id: "tc4", input: "[[1,4],[2,3]]", expectedOutput: "[[1,4]]", isHidden: true },
      { id: "tc5", input: "[[1,4],[0,0]]", expectedOutput: "[[0,0],[1,4]]", isHidden: true },
    ],
  },
  {
    slug: "coin-change",
    title: "Coin Change",
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    difficulty: "medium",
    category: "Dynamic Programming",
    xpReward: 25,
    constraints: `- 1 <= coins.length <= 12
- 1 <= coins[i] <= 2^31 - 1
- 0 <= amount <= 10^4`,
    examples: [
      { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" },
    ],
    hints: [
      "This is a classic dynamic programming problem.",
      "Define dp[i] as the minimum coins needed for amount i.",
      "For each amount, try using each coin and take the minimum.",
    ],
    starterCode: {
      javascript: `function solution(coins, amount) {
  // Your code here
}`,
      python: `def solution(coins, amount):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      python: `def solution(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] != float('inf'):
                dp[i] = min(dp[i], dp[i - coin] + 1)

    return dp[amount] if dp[amount] != float('inf') else -1`,
    },
    timeComplexity: "O(amount * n)",
    spaceComplexity: "O(amount)",
    testCases: [
      { id: "tc1", input: "[[1,2,5], 11]", expectedOutput: "3", isHidden: false },
      { id: "tc2", input: "[[2], 3]", expectedOutput: "-1", isHidden: false },
      { id: "tc3", input: "[[1], 0]", expectedOutput: "0", isHidden: false },
      { id: "tc4", input: "[[1,2,5], 100]", expectedOutput: "20", isHidden: true },
      { id: "tc5", input: "[[186,419,83,408], 6249]", expectedOutput: "20", isHidden: true },
    ],
  },
  {
    slug: "binary-tree-level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    description: `Given the \`root\` of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

The input is given as an array representation of the tree where null represents missing nodes.`,
    difficulty: "medium",
    category: "Trees",
    xpReward: 25,
    constraints: `- The number of nodes in the tree is in the range [0, 2000].
- -1000 <= Node.val <= 1000`,
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
      { input: "root = [1]", output: "[[1]]" },
      { input: "root = []", output: "[]" },
    ],
    hints: [
      "Use BFS (Breadth-First Search) with a queue.",
      "Process all nodes at the current level before moving to the next.",
      "Track the number of nodes at each level.",
    ],
    starterCode: {
      javascript: `function solution(root) {
  // Your code here
}`,
      python: `def solution(root):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(root) {
  if (!root || root.length === 0 || root[0] === null) return [];

  const nodes = root.map(val => val === null ? null : { val, left: null, right: null });
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] !== null) {
      const leftIdx = 2 * i + 1;
      const rightIdx = 2 * i + 2;
      if (leftIdx < nodes.length) nodes[i].left = nodes[leftIdx];
      if (rightIdx < nodes.length) nodes[i].right = nodes[rightIdx];
    }
  }

  const result = [];
  const queue = [nodes[0]];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}`,
      python: `def solution(root):
    if not root:
        return []
    from collections import deque
    result = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    testCases: [
      { id: "tc1", input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]", isHidden: false },
      { id: "tc2", input: "[1]", expectedOutput: "[[1]]", isHidden: false },
      { id: "tc3", input: "[]", expectedOutput: "[]", isHidden: false },
      { id: "tc4", input: "[1,2,3,4,5]", expectedOutput: "[[1],[2,3],[4,5]]", isHidden: true },
    ],
  },

  // Hard Challenges (5)
  {
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    difficulty: "hard",
    category: "Two Pointers",
    xpReward: 50,
    constraints: `- n == height.length
- 1 <= n <= 2 * 10^4
- 0 <= height[i] <= 10^5`,
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped." },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ],
    hints: [
      "Water at each position depends on the minimum of max heights on both sides.",
      "Use two pointers and track max heights from both ends.",
      "Process the side with the smaller max height.",
    ],
    starterCode: {
      javascript: `function solution(height) {
  // Your code here
}`,
      python: `def solution(height):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(height) {
  if (height.length === 0) return 0;

  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }

  return water;
}`,
      python: `def solution(height):
    if not height:
        return 0

    left, right = 0, len(height) - 1
    left_max = right_max = water = 0

    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1

    return water`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    testCases: [
      { id: "tc1", input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6", isHidden: false },
      { id: "tc2", input: "[4,2,0,3,2,5]", expectedOutput: "9", isHidden: false },
      { id: "tc3", input: "[1,2,3,4,5]", expectedOutput: "0", isHidden: false },
      { id: "tc4", input: "[5,4,3,2,1]", expectedOutput: "0", isHidden: true },
      { id: "tc5", input: "[0,1,0,2,1,0,3,1,0,1,2]", expectedOutput: "8", isHidden: true },
    ],
  },
  {
    slug: "longest-valid-parentheses",
    title: "Longest Valid Parentheses",
    description: `Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.`,
    difficulty: "hard",
    category: "Dynamic Programming",
    xpReward: 50,
    constraints: `- 0 <= s.length <= 3 * 10^4
- s[i] is '(' or ')'.`,
    examples: [
      { input: 's = "(()"', output: "2", explanation: 'The longest valid parentheses substring is "()".' },
      { input: 's = ")()())"', output: "4", explanation: 'The longest valid parentheses substring is "()()".' },
      { input: 's = ""', output: "0" },
    ],
    hints: [
      "Use a stack to track indices of unmatched parentheses.",
      "Push -1 initially as a base for length calculation.",
      "When matched, calculate length using current index minus stack top.",
    ],
    starterCode: {
      javascript: `function solution(s) {
  // Your code here
}`,
      python: `def solution(s):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(s) {
  const stack = [-1];
  let maxLen = 0;

  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i);
      } else {
        maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
      }
    }
  }

  return maxLen;
}`,
      python: `def solution(s):
    stack = [-1]
    max_len = 0
    for i, char in enumerate(s):
        if char == '(':
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                max_len = max(max_len, i - stack[-1])
    return max_len`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    testCases: [
      { id: "tc1", input: '"(()"', expectedOutput: "2", isHidden: false },
      { id: "tc2", input: '")()())"', expectedOutput: "4", isHidden: false },
      { id: "tc3", input: '""', expectedOutput: "0", isHidden: false },
      { id: "tc4", input: '"()(())"', expectedOutput: "6", isHidden: true },
      { id: "tc5", input: '"(()(((())"', expectedOutput: "6", isHidden: true },
    ],
  },
  {
    slug: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
    difficulty: "hard",
    category: "Binary Search",
    xpReward: 50,
    constraints: `- nums1.length == m
- nums2.length == n
- 0 <= m <= 1000
- 0 <= n <= 1000
- 1 <= m + n <= 2000
- -10^6 <= nums1[i], nums2[i] <= 10^6`,
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "merged array = [1,2,3] and median is 2." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000", explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5." },
    ],
    hints: [
      "Use binary search on the smaller array.",
      "Partition both arrays such that left sides have equal or one more element.",
      "The median is determined by the elements around the partition.",
    ],
    starterCode: {
      javascript: `function solution(nums1, nums2) {
  // Your code here
}`,
      python: `def solution(nums1, nums2):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(nums1, nums2) {
  if (nums1.length > nums2.length) {
    [nums1, nums2] = [nums2, nums1];
  }

  const m = nums1.length;
  const n = nums2.length;
  let left = 0;
  let right = m;

  while (left <= right) {
    const i = Math.floor((left + right) / 2);
    const j = Math.floor((m + n + 1) / 2) - i;

    const nums1Left = i === 0 ? -Infinity : nums1[i - 1];
    const nums1Right = i === m ? Infinity : nums1[i];
    const nums2Left = j === 0 ? -Infinity : nums2[j - 1];
    const nums2Right = j === n ? Infinity : nums2[j];

    if (nums1Left <= nums2Right && nums2Left <= nums1Right) {
      if ((m + n) % 2 === 0) {
        return (Math.max(nums1Left, nums2Left) + Math.min(nums1Right, nums2Right)) / 2;
      }
      return Math.max(nums1Left, nums2Left);
    } else if (nums1Left > nums2Right) {
      right = i - 1;
    } else {
      left = i + 1;
    }
  }

  return 0;
}`,
      python: `def solution(nums1, nums2):
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1

    m, n = len(nums1), len(nums2)
    left, right = 0, m

    while left <= right:
        i = (left + right) // 2
        j = (m + n + 1) // 2 - i

        nums1_left = float('-inf') if i == 0 else nums1[i - 1]
        nums1_right = float('inf') if i == m else nums1[i]
        nums2_left = float('-inf') if j == 0 else nums2[j - 1]
        nums2_right = float('inf') if j == n else nums2[j]

        if nums1_left <= nums2_right and nums2_left <= nums1_right:
            if (m + n) % 2 == 0:
                return (max(nums1_left, nums2_left) + min(nums1_right, nums2_right)) / 2
            return max(nums1_left, nums2_left)
        elif nums1_left > nums2_right:
            right = i - 1
        else:
            left = i + 1

    return 0`,
    },
    timeComplexity: "O(log(min(m, n)))",
    spaceComplexity: "O(1)",
    testCases: [
      { id: "tc1", input: "[[1,3], [2]]", expectedOutput: "2", isHidden: false },
      { id: "tc2", input: "[[1,2], [3,4]]", expectedOutput: "2.5", isHidden: false },
      { id: "tc3", input: "[[0,0], [0,0]]", expectedOutput: "0", isHidden: false },
      { id: "tc4", input: "[[], [1]]", expectedOutput: "1", isHidden: true },
      { id: "tc5", input: "[[2], []]", expectedOutput: "2", isHidden: true },
    ],
  },
  {
    slug: "word-ladder",
    title: "Word Ladder",
    description: `A transformation sequence from word \`beginWord\` to word \`endWord\` using a dictionary \`wordList\` is a sequence of words such that:

- The first word in the sequence is \`beginWord\`.
- The last word in the sequence is \`endWord\`.
- Only one letter can be changed at a time.
- Each transformed word must exist in the \`wordList\`.

Given two words, \`beginWord\` and \`endWord\`, and a dictionary \`wordList\`, return the number of words in the shortest transformation sequence from \`beginWord\` to \`endWord\`, or \`0\` if no such sequence exists.`,
    difficulty: "hard",
    category: "Graph",
    xpReward: 50,
    constraints: `- 1 <= beginWord.length <= 10
- endWord.length == beginWord.length
- 1 <= wordList.length <= 5000
- wordList[i].length == beginWord.length
- beginWord, endWord, and wordList[i] consist of lowercase English letters.
- beginWord != endWord
- All the words in wordList are unique.`,
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5", explanation: 'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog".' },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: "0", explanation: 'The endWord "cog" is not in wordList.' },
    ],
    hints: [
      "Model this as a graph where words are nodes and edges connect words differing by one letter.",
      "Use BFS to find the shortest path.",
      "Generate all possible one-letter transformations for each word.",
    ],
    starterCode: {
      javascript: `function solution(beginWord, endWord, wordList) {
  // Your code here
}`,
      python: `def solution(beginWord, endWord, wordList):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);

  if (!wordSet.has(endWord)) return 0;

  const queue = [[beginWord, 1]];
  const visited = new Set([beginWord]);

  while (queue.length > 0) {
    const [word, level] = queue.shift();

    if (word === endWord) return level;

    for (let i = 0; i < word.length; i++) {
      for (let c = 97; c <= 122; c++) {
        const newWord = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);

        if (wordSet.has(newWord) && !visited.has(newWord)) {
          visited.add(newWord);
          queue.push([newWord, level + 1]);
        }
      }
    }
  }

  return 0;
}`,
      python: `def solution(beginWord, endWord, wordList):
    from collections import deque
    word_set = set(wordList)
    if endWord not in word_set:
        return 0

    queue = deque([(beginWord, 1)])
    visited = {beginWord}

    while queue:
        word, level = queue.popleft()
        if word == endWord:
            return level

        for i in range(len(word)):
            for c in 'abcdefghijklmnopqrstuvwxyz':
                new_word = word[:i] + c + word[i+1:]
                if new_word in word_set and new_word not in visited:
                    visited.add(new_word)
                    queue.append((new_word, level + 1))

    return 0`,
    },
    timeComplexity: "O(m² * n)",
    spaceComplexity: "O(m * n)",
    testCases: [
      { id: "tc1", input: '["hit", "cog", ["hot","dot","dog","lot","log","cog"]]', expectedOutput: "5", isHidden: false },
      { id: "tc2", input: '["hit", "cog", ["hot","dot","dog","lot","log"]]', expectedOutput: "0", isHidden: false },
      { id: "tc3", input: '["a", "c", ["a","b","c"]]', expectedOutput: "2", isHidden: false },
      { id: "tc4", input: '["hot", "dog", ["hot","dog","dot"]]', expectedOutput: "3", isHidden: true },
    ],
  },
  {
    slug: "serialize-deserialize-binary-tree",
    title: "Serialize and Deserialize Binary Tree",
    description: `Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer.

Design an algorithm to serialize and deserialize a binary tree. Implement both \`serialize\` and \`deserialize\` functions.

For this problem, the input is a serialized string and you need to deserialize it back to a tree and then serialize it again. The output should match the input.`,
    difficulty: "hard",
    category: "Trees",
    xpReward: 50,
    constraints: `- The number of nodes in the tree is in the range [0, 10^4].
- -1000 <= Node.val <= 1000`,
    examples: [
      { input: '"1,2,null,null,3,4,null,null,5,null,null"', output: '"1,2,null,null,3,4,null,null,5,null,null"' },
      { input: '"null"', output: '"null"' },
    ],
    hints: [
      "Use preorder traversal for serialization.",
      "Use a delimiter to separate values and mark null nodes.",
      "For deserialization, recursively build the tree from the serialized string.",
    ],
    starterCode: {
      javascript: `function solution(data) {
  // Your code here
}`,
      python: `def solution(data):
    # Your code here
    pass`,
    },
    solutions: {
      javascript: `function solution(data) {
  const values = data.split(',');
  let index = 0;

  function deserialize() {
    if (index >= values.length || values[index] === 'null') {
      index++;
      return null;
    }

    const node = { val: parseInt(values[index++]), left: null, right: null };
    node.left = deserialize();
    node.right = deserialize();
    return node;
  }

  const root = deserialize();

  function serialize(node) {
    if (!node) return 'null';
    return node.val + ',' + serialize(node.left) + ',' + serialize(node.right);
  }

  return serialize(root);
}`,
      python: `def solution(data):
    values = data.split(',')
    index = [0]

    def deserialize():
        if index[0] >= len(values) or values[index[0]] == 'null':
            index[0] += 1
            return None

        node = {'val': int(values[index[0]]), 'left': None, 'right': None}
        index[0] += 1
        node['left'] = deserialize()
        node['right'] = deserialize()
        return node

    root = deserialize()

    def serialize(node):
        if not node:
            return 'null'
        return str(node['val']) + ',' + serialize(node['left']) + ',' + serialize(node['right'])

    return serialize(root)`,
    },
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    testCases: [
      { id: "tc1", input: '"1,2,null,null,3,4,null,null,5,null,null"', expectedOutput: '"1,2,null,null,3,4,null,null,5,null,null"', isHidden: false },
      { id: "tc2", input: '"null"', expectedOutput: '"null"', isHidden: false },
      { id: "tc3", input: '"1,null,null"', expectedOutput: '"1,null,null"', isHidden: false },
      { id: "tc4", input: '"1,2,3,null,null,null,null"', expectedOutput: '"1,2,3,null,null,null,null"', isHidden: true },
    ],
  },
];

// Hunt Mode - Bugs Data (15+ bugs)
const bugs: BugData[] = [
  // EASY BUGS (5)
  {
    slug: "off-by-one-loop",
    title: "Off-by-One Loop Error",
    description: "This function should sum all elements in an array, but it's returning incorrect results for some inputs. Find and fix the bug.",
    difficulty: "easy",
    type: "logic",
    language: "javascript",
    buggyCode: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
    correctCode: `function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,
    hint: "Check the loop boundary condition carefully. What happens when i equals arr.length?",
    explanation: "The bug is a classic off-by-one error. The loop condition `i <= arr.length` causes the loop to iterate one extra time, accessing `arr[arr.length]` which is `undefined`. Adding `undefined` to a number results in `NaN`. The fix is to change `<=` to `<`.",
    xpReward: 15,
    testCases: [
      { id: "tc1", input: "[1, 2, 3, 4, 5]", expectedOutput: "15" },
      { id: "tc2", input: "[10]", expectedOutput: "10" },
      { id: "tc3", input: "[]", expectedOutput: "0" },
      { id: "tc4", input: "[-1, -2, 3]", expectedOutput: "0", isHidden: true },
      { id: "tc5", input: "[100, 200, 300]", expectedOutput: "600", isHidden: true },
    ],
  },
  {
    slug: "wrong-comparison-operator",
    title: "Wrong Comparison Operator",
    description: "This function should find the maximum value in an array. It works for some cases but fails for others. Find the bug!",
    difficulty: "easy",
    type: "logic",
    language: "javascript",
    buggyCode: `function findMax(arr) {
  if (arr.length === 0) return null;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < max) {
      max = arr[i];
    }
  }
  return max;
}`,
    correctCode: `function findMax(arr) {
  if (arr.length === 0) return null;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`,
    hint: "Look at the comparison operator. What does it mean to find a maximum?",
    explanation: "The bug is using `<` instead of `>` in the comparison. To find the maximum, we need to update `max` when we find a value that is greater than the current max, not less than.",
    xpReward: 15,
    testCases: [
      { id: "tc1", input: "[1, 5, 3, 9, 2]", expectedOutput: "9" },
      { id: "tc2", input: "[7]", expectedOutput: "7" },
      { id: "tc3", input: "[-5, -2, -8]", expectedOutput: "-2" },
      { id: "tc4", input: "[0, 0, 0]", expectedOutput: "0", isHidden: true },
      { id: "tc5", input: "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]", expectedOutput: "10", isHidden: true },
    ],
  },
  {
    slug: "string-equality-bug",
    title: "String Type Coercion Bug",
    description: "This function should check if a user is an admin. Something's wrong with the comparison. Users who aren't admins are getting access!",
    difficulty: "easy",
    type: "security",
    language: "javascript",
    buggyCode: `function isAdmin(userRole) {
  if (userRole == 1) {
    return true;
  }
  return false;
}`,
    correctCode: `function isAdmin(userRole) {
  if (userRole === 1) {
    return true;
  }
  return false;
}`,
    hint: "JavaScript has two equality operators: == and ===. What's the difference?",
    explanation: "The bug uses loose equality `==` which performs type coercion. This means `'1' == 1` returns `true`, allowing string '1' to pass the check. Using strict equality `===` ensures both type and value must match, preventing unintended type coercion vulnerabilities.",
    xpReward: 15,
    testCases: [
      { id: "tc1", input: "1", expectedOutput: "true" },
      { id: "tc2", input: "0", expectedOutput: "false" },
      { id: "tc3", input: "\"1\"", expectedOutput: "false" },
      { id: "tc4", input: "2", expectedOutput: "false", isHidden: true },
      { id: "tc5", input: "null", expectedOutput: "false", isHidden: true },
    ],
  },
  {
    slug: "missing-return-statement",
    title: "Missing Return Statement",
    description: "This function should check if a number is even, but it always returns undefined for odd numbers. Fix it!",
    difficulty: "easy",
    type: "logic",
    language: "javascript",
    buggyCode: `function isEven(num) {
  if (num % 2 === 0) {
    return true;
  }
  // Missing return for odd numbers
}`,
    correctCode: `function isEven(num) {
  if (num % 2 === 0) {
    return true;
  }
  return false;
}`,
    hint: "What happens when the if condition is false? Does the function return anything?",
    explanation: "The function doesn't have a return statement for when the number is odd. In JavaScript, functions without an explicit return statement return `undefined`. The fix is to add `return false` for the else case.",
    xpReward: 15,
    testCases: [
      { id: "tc1", input: "4", expectedOutput: "true" },
      { id: "tc2", input: "7", expectedOutput: "false" },
      { id: "tc3", input: "0", expectedOutput: "true" },
      { id: "tc4", input: "-2", expectedOutput: "true", isHidden: true },
      { id: "tc5", input: "101", expectedOutput: "false", isHidden: true },
    ],
  },
  {
    slug: "wrong-array-method",
    title: "Wrong Array Method",
    description: "This function should remove the first element from an array and return it. But it's removing from the wrong end!",
    difficulty: "easy",
    type: "logic",
    language: "javascript",
    buggyCode: `function removeFirst(arr) {
  return arr.pop();
}`,
    correctCode: `function removeFirst(arr) {
  return arr.shift();
}`,
    hint: "pop() and shift() both remove elements, but from different ends of the array.",
    explanation: "The bug uses `pop()` which removes the last element, but we need `shift()` which removes the first element. Understanding the difference between these array methods is fundamental.",
    xpReward: 15,
    testCases: [
      { id: "tc1", input: "[1, 2, 3]", expectedOutput: "1" },
      { id: "tc2", input: "[\"a\", \"b\", \"c\"]", expectedOutput: "\"a\"" },
      { id: "tc3", input: "[42]", expectedOutput: "42" },
      { id: "tc4", input: "[true, false]", expectedOutput: "true", isHidden: true },
      { id: "tc5", input: "[10, 20, 30, 40, 50]", expectedOutput: "10", isHidden: true },
    ],
  },

  // MEDIUM BUGS (6)
  {
    slug: "closure-in-loop",
    title: "Closure Bug in Loop",
    description: "This function creates an array of functions that should log numbers 0-4. But they all log 5! Find the bug.",
    difficulty: "medium",
    type: "logic",
    language: "javascript",
    buggyCode: `function createCounters() {
  const counters = [];
  for (var i = 0; i < 5; i++) {
    counters.push(function() {
      return i;
    });
  }
  return counters;
}`,
    correctCode: `function createCounters() {
  const counters = [];
  for (let i = 0; i < 5; i++) {
    counters.push(function() {
      return i;
    });
  }
  return counters;
}`,
    hint: "Consider the difference between var and let in terms of scoping. When does the closure capture the value of i?",
    explanation: "This is a classic JavaScript closure bug. Using `var` creates a function-scoped variable, so all closures share the same `i` which ends up being 5 after the loop. Using `let` creates a block-scoped variable, giving each iteration its own `i`. This is one of the main reasons `let` was introduced in ES6.",
    xpReward: 25,
    testCases: [
      { id: "tc1", input: "0", expectedOutput: "0" },
      { id: "tc2", input: "2", expectedOutput: "2" },
      { id: "tc3", input: "4", expectedOutput: "4" },
      { id: "tc4", input: "1", expectedOutput: "1", isHidden: true },
      { id: "tc5", input: "3", expectedOutput: "3", isHidden: true },
    ],
  },
  {
    slug: "object-mutation-bug",
    title: "Unintended Object Mutation",
    description: "This function should return a modified copy of a user object with updated name. But it's mutating the original object!",
    difficulty: "medium",
    type: "logic",
    language: "javascript",
    buggyCode: `function updateUserName(user, newName) {
  const updatedUser = user;
  updatedUser.name = newName;
  return updatedUser;
}`,
    correctCode: `function updateUserName(user, newName) {
  const updatedUser = { ...user };
  updatedUser.name = newName;
  return updatedUser;
}`,
    hint: "In JavaScript, objects are passed by reference. What happens when you assign an object to a new variable?",
    explanation: "The bug is that `const updatedUser = user` doesn't create a copy - it creates another reference to the same object. Any changes to `updatedUser` also affect `user`. The fix uses the spread operator `{ ...user }` to create a shallow copy of the object.",
    xpReward: 25,
    testCases: [
      { id: "tc1", input: "[{\"name\": \"Alice\", \"age\": 30}, \"Bob\"]", expectedOutput: "{\"name\":\"Bob\",\"age\":30}" },
      { id: "tc2", input: "[{\"name\": \"John\"}, \"Jane\"]", expectedOutput: "{\"name\":\"Jane\"}" },
      { id: "tc3", input: "[{\"name\": \"X\", \"role\": \"admin\"}, \"Y\"]", expectedOutput: "{\"name\":\"Y\",\"role\":\"admin\"}" },
      { id: "tc4", input: "[{\"name\": \"Test\", \"id\": 1}, \"Updated\"]", expectedOutput: "{\"name\":\"Updated\",\"id\":1}", isHidden: true },
    ],
  },
  {
    slug: "async-await-missing",
    title: "Missing Await Keyword",
    description: "This async function should fetch user data and return the user's name. But it's returning a Promise instead of the name!",
    difficulty: "medium",
    type: "logic",
    language: "javascript",
    buggyCode: `async function getUserName(userId) {
  const response = fetch(\`/api/users/\${userId}\`);
  const user = response.json();
  return user.name;
}`,
    correctCode: `async function getUserName(userId) {
  const response = await fetch(\`/api/users/\${userId}\`);
  const user = await response.json();
  return user.name;
}`,
    hint: "fetch() and .json() both return Promises. What keyword is needed to wait for a Promise to resolve?",
    explanation: "The bug is missing `await` keywords before `fetch()` and `.json()`. Without `await`, these return Promise objects instead of the resolved values. You're trying to access `.json()` on a Promise and `.name` on another Promise, which doesn't work as expected.",
    xpReward: 25,
    testCases: [
      { id: "tc1", input: "1", expectedOutput: "\"Alice\"" },
      { id: "tc2", input: "2", expectedOutput: "\"Bob\"" },
      { id: "tc3", input: "3", expectedOutput: "\"Charlie\"" },
      { id: "tc4", input: "4", expectedOutput: "\"Diana\"", isHidden: true },
    ],
  },
  {
    slug: "sql-injection-vulnerability",
    title: "SQL Injection Vulnerability",
    description: "This function builds a SQL query to find users. It has a serious security vulnerability. Fix it!",
    difficulty: "medium",
    type: "security",
    language: "javascript",
    buggyCode: `function findUser(username) {
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  return query;
}`,
    correctCode: `function findUser(username) {
  const query = "SELECT * FROM users WHERE username = ?";
  return { query, params: [username] };
}`,
    hint: "What happens if username contains special SQL characters like quotes or semicolons?",
    explanation: "This is a classic SQL injection vulnerability. If a user enters `'; DROP TABLE users; --` as their username, the query becomes destructive. The fix uses parameterized queries where the user input is passed separately and properly escaped by the database driver.",
    xpReward: 30,
    testCases: [
      { id: "tc1", input: "\"alice\"", expectedOutput: "{\"query\":\"SELECT * FROM users WHERE username = ?\",\"params\":[\"alice\"]}" },
      { id: "tc2", input: "\"bob\"", expectedOutput: "{\"query\":\"SELECT * FROM users WHERE username = ?\",\"params\":[\"bob\"]}" },
      { id: "tc3", input: "\"'; DROP TABLE users; --\"", expectedOutput: "{\"query\":\"SELECT * FROM users WHERE username = ?\",\"params\":[\"'; DROP TABLE users; --\"]}" },
      { id: "tc4", input: "\"admin' OR '1'='1\"", expectedOutput: "{\"query\":\"SELECT * FROM users WHERE username = ?\",\"params\":[\"admin' OR '1'='1\"]}", isHidden: true },
    ],
  },
  {
    slug: "inefficient-array-search",
    title: "Inefficient Array Search",
    description: "This function checks if an item exists in an array inside a loop. It works but is very slow for large arrays. Optimize it!",
    difficulty: "medium",
    type: "performance",
    language: "javascript",
    buggyCode: `function findCommonElements(arr1, arr2) {
  const common = [];
  for (const item of arr1) {
    if (arr2.includes(item)) {
      common.push(item);
    }
  }
  return common;
}`,
    correctCode: `function findCommonElements(arr1, arr2) {
  const set2 = new Set(arr2);
  const common = [];
  for (const item of arr1) {
    if (set2.has(item)) {
      common.push(item);
    }
  }
  return common;
}`,
    hint: "Array.includes() is O(n). Is there a data structure that allows O(1) lookups?",
    explanation: "The original code has O(n*m) complexity because `includes()` scans the entire array for each element. By converting arr2 to a Set first, lookups become O(1) using `has()`, reducing overall complexity to O(n+m). This is a significant performance improvement for large arrays.",
    xpReward: 25,
    testCases: [
      { id: "tc1", input: "[[1,2,3,4], [3,4,5,6]]", expectedOutput: "[3,4]" },
      { id: "tc2", input: "[[1,2], [3,4]]", expectedOutput: "[]" },
      { id: "tc3", input: "[[\"a\",\"b\"], [\"b\",\"c\"]]", expectedOutput: "[\"b\"]" },
      { id: "tc4", input: "[[1,1,2,2], [2,2,3,3]]", expectedOutput: "[2,2]", isHidden: true },
      { id: "tc5", input: "[[], [1,2,3]]", expectedOutput: "[]", isHidden: true },
    ],
  },
  {
    slug: "floating-point-comparison",
    title: "Floating Point Comparison Bug",
    description: "This function should check if two decimal numbers are equal after a calculation. But it's giving wrong results!",
    difficulty: "medium",
    type: "edge_case",
    language: "javascript",
    buggyCode: `function areEqual(a, b) {
  return a === b;
}`,
    correctCode: `function areEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}`,
    hint: "Try calculating 0.1 + 0.2 in JavaScript. Is the result exactly 0.3?",
    explanation: "Floating point numbers in JavaScript (and most languages) can't represent all decimal values exactly. 0.1 + 0.2 equals 0.30000000000000004, not 0.3. The fix compares if the difference is smaller than Number.EPSILON (the smallest difference between two representable numbers).",
    xpReward: 25,
    testCases: [
      { id: "tc1", input: "[0.30000000000000004, 0.3]", expectedOutput: "true" },
      { id: "tc2", input: "[0.1, 0.1]", expectedOutput: "true" },
      { id: "tc3", input: "[0.1, 0.2]", expectedOutput: "false" },
      { id: "tc4", input: "[0.7, 0.70000000000000001]", expectedOutput: "true", isHidden: true },
      { id: "tc5", input: "[1.0, 1.0000000000000002]", expectedOutput: "true", isHidden: true },
    ],
  },

  // HARD BUGS (4)
  {
    slug: "race-condition-counter",
    title: "Race Condition in Counter",
    description: "This counter function is being called by multiple async operations, but the final count is often wrong. Fix the race condition!",
    difficulty: "hard",
    type: "logic",
    language: "javascript",
    buggyCode: `let count = 0;

async function incrementCounter() {
  const current = count;
  await delay(10); // Simulates async operation
  count = current + 1;
  return count;
}`,
    correctCode: `let count = 0;
let mutex = Promise.resolve();

async function incrementCounter() {
  mutex = mutex.then(async () => {
    const current = count;
    await delay(10);
    count = current + 1;
  });
  await mutex;
  return count;
}`,
    hint: "Multiple operations read the same 'current' value before any of them write back. How can you ensure operations happen one at a time?",
    explanation: "This is a race condition. Multiple calls read the same `count` value before any write happens. The fix implements a simple mutex using promise chaining, ensuring each operation completes before the next begins. In real applications, you might use atomic operations or proper locking mechanisms.",
    xpReward: 40,
    testCases: [
      { id: "tc1", input: "1", expectedOutput: "1" },
      { id: "tc2", input: "5", expectedOutput: "5" },
      { id: "tc3", input: "10", expectedOutput: "10" },
      { id: "tc4", input: "3", expectedOutput: "3", isHidden: true },
    ],
  },
  {
    slug: "memory-leak-event-listener",
    title: "Memory Leak from Event Listeners",
    description: "This component adds event listeners but never removes them, causing a memory leak. Fix it!",
    difficulty: "hard",
    type: "performance",
    language: "javascript",
    buggyCode: `class Component {
  constructor() {
    this.handleClick = () => console.log('clicked');
    document.addEventListener('click', this.handleClick);
  }

  destroy() {
    // Missing cleanup!
  }
}`,
    correctCode: `class Component {
  constructor() {
    this.handleClick = () => console.log('clicked');
    document.addEventListener('click', this.handleClick);
  }

  destroy() {
    document.removeEventListener('click', this.handleClick);
  }
}`,
    hint: "When a component is destroyed, its event listeners should also be removed. Otherwise, they keep references to the component in memory.",
    explanation: "Event listeners maintain references to their callback functions and any variables in their closure. If not removed, they prevent garbage collection of the component, causing memory leaks. Always clean up event listeners in destroy/unmount methods.",
    xpReward: 40,
    testCases: [
      { id: "tc1", input: "\"click\"", expectedOutput: "true" },
      { id: "tc2", input: "\"destroy\"", expectedOutput: "true" },
      { id: "tc3", input: "\"cleanup\"", expectedOutput: "true" },
    ],
  },
  {
    slug: "prototype-pollution",
    title: "Prototype Pollution Vulnerability",
    description: "This function merges objects but has a serious security vulnerability that allows modifying Object.prototype. Fix it!",
    difficulty: "hard",
    type: "security",
    language: "javascript",
    buggyCode: `function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      if (!target[key]) target[key] = {};
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}`,
    correctCode: `function merge(target, source) {
  for (const key in source) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key]) target[key] = {};
        merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}`,
    hint: "What happens if source contains a key named '__proto__'? It could modify the prototype of all objects!",
    explanation: "Prototype pollution allows attackers to inject properties into Object.prototype by using keys like '__proto__', 'constructor', or 'prototype'. This can affect all objects in the application. The fix explicitly blocks these dangerous keys and uses hasOwnProperty to only process own properties.",
    xpReward: 50,
    testCases: [
      { id: "tc1", input: "[{}, {\"a\": 1}]", expectedOutput: "{\"a\":1}" },
      { id: "tc2", input: "[{\"x\": 1}, {\"y\": 2}]", expectedOutput: "{\"x\":1,\"y\":2}" },
      { id: "tc3", input: "[{}, {\"__proto__\": {\"polluted\": true}}]", expectedOutput: "{}" },
      { id: "tc4", input: "[{\"a\": {\"b\": 1}}, {\"a\": {\"c\": 2}}]", expectedOutput: "{\"a\":{\"b\":1,\"c\":2}}", isHidden: true },
    ],
  },
  {
    slug: "regex-dos",
    title: "ReDoS Vulnerability",
    description: "This regex validation is vulnerable to catastrophic backtracking (ReDoS). An attacker can freeze the server with a crafted input. Fix it!",
    difficulty: "hard",
    type: "security",
    language: "javascript",
    buggyCode: `function validateEmail(email) {
  const regex = /^([a-zA-Z0-9]+)+@([a-zA-Z0-9]+)+\\.([a-zA-Z]{2,})$/;
  return regex.test(email);
}`,
    correctCode: `function validateEmail(email) {
  const regex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}`,
    hint: "The pattern (a+)+ causes exponential backtracking. What's the simplest way to match one or more characters without nested quantifiers?",
    explanation: "The pattern `([a-zA-Z0-9]+)+` has nested quantifiers causing catastrophic backtracking. An input like 'aaaaaaaaaaaaaaaaaaaaaaaaa!' can freeze the regex engine. The fix removes the unnecessary grouping and nested quantifiers, making the pattern linear in complexity.",
    xpReward: 50,
    testCases: [
      { id: "tc1", input: "\"test@example.com\"", expectedOutput: "true" },
      { id: "tc2", input: "\"user@domain.org\"", expectedOutput: "true" },
      { id: "tc3", input: "\"invalid\"", expectedOutput: "false" },
      { id: "tc4", input: "\"a@b.co\"", expectedOutput: "true", isHidden: true },
      { id: "tc5", input: "\"test@test\"", expectedOutput: "false", isHidden: true },
    ],
  },
];

// Project Data for Build Mode
interface MilestoneData {
  orderIndex: number;
  title: string;
  description: string;
  instructions: string;
  requirements: string[];
  starterFiles: Record<string, string>;
  testCriteria: Array<{
    type: string;
    target?: string;
    value?: string;
    description?: string;
  }>;
  xpReward: number;
}

interface ProjectData {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  techStack: string[];
  estimatedHours: number;
  xpReward: number;
  skills: string[];
  milestones: MilestoneData[];
}

// Academy Mode - Learning Path Data
interface LessonData {
  orderIndex: number;
  title: string;
  type: "concept" | "exercise" | "quiz";
  content: string;
  xpReward: number;
  exercise?: {
    instructions: string;
    starterCode: Record<string, string>;
    solution: Record<string, string>;
    testCases: Array<{ input: string; expectedOutput: string }>;
  };
  quiz?: {
    questions: Array<{
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }>;
  };
}

interface PhaseData {
  orderIndex: number;
  title: string;
  description: string;
  deliverable: string | null;
  xpReward: number;
  lessons: LessonData[];
}

interface LearningPathData {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  skills: string[];
  totalXp: number;
  phases: PhaseData[];
}

const learningPaths: LearningPathData[] = [
  {
    slug: "full-stack-fundamentals",
    title: "Full Stack Fundamentals",
    description: "Master the essentials of full-stack web development. Build a complete Todo application from scratch while learning HTML, CSS, JavaScript, React, Node.js, and databases.",
    difficulty: "beginner",
    estimatedHours: 40,
    skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "PostgreSQL", "REST APIs", "Git"],
    totalXp: 1500,
    phases: [
      {
        orderIndex: 0,
        title: "Planning & Discovery",
        description: "Understand the project requirements, set up your development environment, and learn the basics of how web applications work.",
        deliverable: "Project setup complete with Git repository initialized",
        xpReward: 50,
        lessons: [
          {
            orderIndex: 0,
            title: "Introduction to Web Development",
            type: "concept",
            content: `# Introduction to Web Development

Welcome to Full Stack Fundamentals! In this learning path, you'll build a complete Todo application while learning all the essential skills of modern web development.

## What is Full Stack Development?

Full stack development means working on both the **frontend** (what users see) and the **backend** (server, database, APIs) of a web application.

### The Frontend
- **HTML** - Structure of the page
- **CSS** - Styling and layout
- **JavaScript** - Interactivity and logic
- **React** - Building dynamic user interfaces

### The Backend
- **Node.js** - JavaScript runtime for servers
- **Express** - Web framework for Node.js
- **PostgreSQL** - Database for storing data
- **REST APIs** - Communication between frontend and backend

## How the Web Works

When you visit a website:
1. Your browser sends a **request** to a server
2. The server processes the request
3. The server sends back a **response** (HTML, CSS, JS)
4. Your browser renders the page

\`\`\`
Browser --> Request --> Server
Browser <-- Response <-- Server
\`\`\`

## What You'll Build

By the end of this path, you'll have built a full-featured Todo application with:
- User authentication (login/signup)
- Create, read, update, delete todos
- Filter and search functionality
- Responsive design
- Database persistence

Let's get started!`,
            xpReward: 10,
          },
          {
            orderIndex: 1,
            title: "Setting Up Your Environment",
            type: "concept",
            content: `# Setting Up Your Development Environment

Before we start coding, let's set up all the tools you'll need.

## Required Software

### 1. Code Editor - VS Code
Download Visual Studio Code from [code.visualstudio.com](https://code.visualstudio.com)

Recommended extensions:
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **GitLens**

### 2. Node.js
Download from [nodejs.org](https://nodejs.org) (LTS version)

Verify installation:
\`\`\`bash
node --version
npm --version
\`\`\`

### 3. Git
Download from [git-scm.com](https://git-scm.com)

Configure Git:
\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
\`\`\`

### 4. Browser Developer Tools
Modern browsers have built-in developer tools. Press F12 or right-click and "Inspect" to open them.

## Creating Your Project

\`\`\`bash
# Create project folder
mkdir todo-app
cd todo-app

# Initialize Git
git init

# Create initial files
touch README.md
touch .gitignore
\`\`\`

### .gitignore file:
\`\`\`
node_modules/
.env
.DS_Store
\`\`\`

## Your First Commit

\`\`\`bash
git add .
git commit -m "Initial commit: Project setup"
\`\`\`

Congratulations! You've set up your development environment.`,
            xpReward: 10,
          },
          {
            orderIndex: 2,
            title: "Environment Setup Quiz",
            type: "quiz",
            content: "Test your understanding of the development environment setup.",
            xpReward: 15,
            quiz: {
              questions: [
                {
                  question: "Which command initializes a new Git repository?",
                  options: ["git start", "git init", "git create", "git new"],
                  correctIndex: 1,
                  explanation: "The 'git init' command creates a new Git repository in the current directory.",
                },
                {
                  question: "What file should you create to tell Git which files to ignore?",
                  options: [".gitconfig", ".gitkeep", ".gitignore", ".gitexclude"],
                  correctIndex: 2,
                  explanation: "The .gitignore file specifies which files and directories Git should ignore.",
                },
                {
                  question: "What does 'Full Stack' development mean?",
                  options: [
                    "Only frontend development",
                    "Only backend development",
                    "Both frontend and backend development",
                    "Only database development",
                  ],
                  correctIndex: 2,
                  explanation: "Full stack development involves working on both the frontend (client-side) and backend (server-side) of applications.",
                },
              ],
            },
          },
          {
            orderIndex: 3,
            title: "Project Planning",
            type: "concept",
            content: `# Project Planning

Before writing code, good developers plan their projects. Let's plan our Todo application.

## User Stories

User stories describe features from the user's perspective:

1. As a user, I want to **add a new todo** so I can track tasks
2. As a user, I want to **mark todos as complete** so I can see my progress
3. As a user, I want to **delete todos** so I can remove tasks I no longer need
4. As a user, I want to **filter todos** so I can focus on specific tasks
5. As a user, I want to **save my todos** so they persist when I refresh

## Data Model

Our Todo will have these properties:

\`\`\`typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}
\`\`\`

## Feature Breakdown

### Phase 1: Basic HTML/CSS
- Create the page structure
- Style the interface

### Phase 2: JavaScript
- Add interactivity
- Manage state

### Phase 3: React
- Build reusable components
- Handle state with hooks

### Phase 4: Backend
- Create API endpoints
- Connect to database

### Phase 5: Full Integration
- Connect frontend to backend
- Deploy the application

## Wireframe

\`\`\`
+----------------------------------+
|          Todo App                |
+----------------------------------+
| [                    ] [Add]     |
+----------------------------------+
| ☐ Buy groceries                  |
| ☑ Complete homework              |
| ☐ Call mom                       |
+----------------------------------+
| All | Active | Completed         |
+----------------------------------+
\`\`\`

With our plan in place, we're ready to start building!`,
            xpReward: 10,
          },
        ],
      },
      {
        orderIndex: 1,
        title: "HTML & CSS Foundations",
        description: "Learn the building blocks of web pages. Create the structure and styling for your Todo application.",
        deliverable: "Complete static HTML/CSS mockup of the Todo app",
        xpReward: 75,
        lessons: [
          {
            orderIndex: 0,
            title: "HTML Basics",
            type: "concept",
            content: `# HTML Basics

HTML (HyperText Markup Language) provides the structure of web pages.

## HTML Document Structure

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
</head>
<body>
  <!-- Content goes here -->
</body>
</html>
\`\`\`

## Common HTML Elements

### Headings
\`\`\`html
<h1>Main Heading</h1>
<h2>Subheading</h2>
<h3>Smaller Heading</h3>
\`\`\`

### Paragraphs and Text
\`\`\`html
<p>This is a paragraph.</p>
<strong>Bold text</strong>
<em>Italic text</em>
\`\`\`

### Lists
\`\`\`html
<ul>
  <li>Unordered item</li>
</ul>

<ol>
  <li>Ordered item</li>
</ol>
\`\`\`

### Links and Images
\`\`\`html
<a href="https://example.com">Click me</a>
<img src="image.jpg" alt="Description">
\`\`\`

### Forms
\`\`\`html
<form>
  <input type="text" placeholder="Enter text">
  <button type="submit">Submit</button>
</form>
\`\`\`

### Divs and Spans
\`\`\`html
<div>Block-level container</div>
<span>Inline container</span>
\`\`\`

## Semantic HTML

Use semantic elements for better accessibility and SEO:

\`\`\`html
<header>Site header</header>
<nav>Navigation</nav>
<main>Main content</main>
<section>Content section</section>
<article>Article content</article>
<footer>Site footer</footer>
\`\`\`

## Attributes

Elements can have attributes:
\`\`\`html
<input type="text" id="username" class="input-field" placeholder="Username">
\`\`\`

- **id** - Unique identifier
- **class** - For styling groups of elements
- **type** - Specifies input type
- **placeholder** - Hint text`,
            xpReward: 15,
          },
          {
            orderIndex: 1,
            title: "Build the Todo HTML Structure",
            type: "exercise",
            content: "Create the HTML structure for our Todo application.",
            xpReward: 20,
            exercise: {
              instructions: `Create the HTML structure for the Todo app:

1. Add a header with the app title "Todo App"
2. Create an input field with a placeholder "What needs to be done?"
3. Add an "Add" button
4. Create an unordered list with id="todo-list"
5. Add a footer with filter buttons (All, Active, Completed)

Your HTML should use semantic elements where appropriate.`,
              starterCode: {
                html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
</head>
<body>
  <!-- TODO: Add your HTML here -->

</body>
</html>`,
              },
              solution: {
                html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
</head>
<body>
  <main class="container">
    <header>
      <h1>Todo App</h1>
    </header>

    <form id="todo-form">
      <input type="text" id="todo-input" placeholder="What needs to be done?">
      <button type="submit">Add</button>
    </form>

    <ul id="todo-list">
      <!-- Todos will be added here -->
    </ul>

    <footer>
      <span id="todo-count">0 items left</span>
      <div class="filters">
        <button class="filter active" data-filter="all">All</button>
        <button class="filter" data-filter="active">Active</button>
        <button class="filter" data-filter="completed">Completed</button>
      </div>
    </footer>
  </main>
</body>
</html>`,
              },
              testCases: [
                { input: "check h1", expectedOutput: "Todo App" },
                { input: "check input#todo-input", expectedOutput: "exists" },
                { input: "check ul#todo-list", expectedOutput: "exists" },
              ],
            },
          },
          {
            orderIndex: 2,
            title: "CSS Fundamentals",
            type: "concept",
            content: `# CSS Fundamentals

CSS (Cascading Style Sheets) controls how HTML elements are displayed.

## Adding CSS

### Inline CSS
\`\`\`html
<p style="color: blue;">Blue text</p>
\`\`\`

### Internal CSS
\`\`\`html
<style>
  p { color: blue; }
</style>
\`\`\`

### External CSS (Recommended)
\`\`\`html
<link rel="stylesheet" href="styles.css">
\`\`\`

## Selectors

\`\`\`css
/* Element selector */
p { color: blue; }

/* Class selector */
.highlight { background: yellow; }

/* ID selector */
#header { font-size: 24px; }

/* Descendant selector */
.container p { margin: 10px; }

/* Multiple selectors */
h1, h2, h3 { font-family: Arial; }
\`\`\`

## The Box Model

Every element is a box with:
- **Content** - The actual content
- **Padding** - Space inside the border
- **Border** - The border around padding
- **Margin** - Space outside the border

\`\`\`css
.box {
  width: 200px;
  padding: 20px;
  border: 1px solid black;
  margin: 10px;
}
\`\`\`

## Common Properties

\`\`\`css
/* Typography */
font-family: Arial, sans-serif;
font-size: 16px;
font-weight: bold;
color: #333;
text-align: center;

/* Box */
width: 100%;
max-width: 600px;
padding: 20px;
margin: 0 auto;
background-color: #f5f5f5;
border-radius: 8px;

/* Layout */
display: flex;
justify-content: center;
align-items: center;
gap: 10px;
\`\`\`

## Flexbox

Flexbox is perfect for layouts:

\`\`\`css
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
\`\`\`

## Responsive Design

Use media queries for different screen sizes:

\`\`\`css
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}
\`\`\``,
            xpReward: 15,
          },
          {
            orderIndex: 3,
            title: "Style the Todo App",
            type: "exercise",
            content: "Apply CSS styling to make our Todo app look great.",
            xpReward: 25,
            exercise: {
              instructions: `Style the Todo app with these requirements:

1. Center the container with max-width of 500px
2. Style the input to take most of the width
3. Make the Add button visually distinct
4. Style todo items with padding and hover effect
5. Use flexbox for the form and filters
6. Add a nice color scheme`,
              starterCode: {
                css: `/* TODO: Add your CSS here */

.container {

}

#todo-form {

}

#todo-input {

}

button {

}

#todo-list {

}

.todo-item {

}

.filters {

}`,
              },
              solution: {
                css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  padding: 30px;
}

header h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

#todo-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

#todo-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

#todo-input:focus {
  outline: none;
  border-color: #667eea;
}

button {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #5a6fd6;
}

#todo-list {
  list-style: none;
  margin-bottom: 20px;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.todo-item:hover {
  background: #f9f9f9;
}

footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 5px;
}

.filter {
  padding: 6px 12px;
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.filter.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}`,
              },
              testCases: [
                { input: "check .container", expectedOutput: "max-width: 500px" },
                { input: "check display", expectedOutput: "flex" },
              ],
            },
          },
          {
            orderIndex: 4,
            title: "HTML & CSS Quiz",
            type: "quiz",
            content: "Test your HTML and CSS knowledge.",
            xpReward: 20,
            quiz: {
              questions: [
                {
                  question: "Which CSS property is used to change text color?",
                  options: ["text-color", "font-color", "color", "text-style"],
                  correctIndex: 2,
                  explanation: "The 'color' property in CSS is used to set the text color of an element.",
                },
                {
                  question: "What does the 'box-sizing: border-box' property do?",
                  options: [
                    "Makes the box invisible",
                    "Includes padding and border in the element's total width/height",
                    "Adds a border to all boxes",
                    "Removes all margins",
                  ],
                  correctIndex: 1,
                  explanation: "border-box includes padding and border in the element's total width and height, making sizing more predictable.",
                },
                {
                  question: "Which HTML element is semantic for the main content?",
                  options: ["<div>", "<content>", "<main>", "<body>"],
                  correctIndex: 2,
                  explanation: "The <main> element represents the main content of the document, unique to the page.",
                },
                {
                  question: "How do you center a block element horizontally with CSS?",
                  options: [
                    "text-align: center",
                    "margin: 0 auto",
                    "position: center",
                    "align: center",
                  ],
                  correctIndex: 1,
                  explanation: "Setting margin: 0 auto on a block element with a defined width centers it horizontally.",
                },
              ],
            },
          },
        ],
      },
      {
        orderIndex: 2,
        title: "JavaScript Essentials",
        description: "Add interactivity to your application. Learn variables, functions, arrays, objects, and DOM manipulation.",
        deliverable: "Fully functional Todo app with vanilla JavaScript",
        xpReward: 100,
        lessons: [
          {
            orderIndex: 0,
            title: "JavaScript Basics",
            type: "concept",
            content: `# JavaScript Basics

JavaScript makes web pages interactive. Let's learn the fundamentals.

## Variables

\`\`\`javascript
// const - cannot be reassigned
const name = "Alice";

// let - can be reassigned
let count = 0;
count = 1;

// Avoid var - use const or let instead
\`\`\`

## Data Types

\`\`\`javascript
// Strings
const greeting = "Hello";
const template = \`Hello, \${name}!\`;

// Numbers
const age = 25;
const price = 9.99;

// Booleans
const isActive = true;
const isComplete = false;

// Arrays
const fruits = ["apple", "banana", "cherry"];

// Objects
const user = {
  name: "Alice",
  age: 25,
  isAdmin: false
};

// null and undefined
let value = null;      // Intentionally empty
let notDefined;        // undefined
\`\`\`

## Operators

\`\`\`javascript
// Arithmetic
5 + 3    // 8
10 - 4   // 6
3 * 4    // 12
10 / 2   // 5
10 % 3   // 1 (remainder)

// Comparison
5 === 5  // true (strict equality)
5 !== 3  // true
5 > 3    // true
5 >= 5   // true

// Logical
true && false  // false (AND)
true || false  // true (OR)
!true          // false (NOT)
\`\`\`

## Functions

\`\`\`javascript
// Function declaration
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Arrow function
const greet = (name) => \`Hello, \${name}!\`;

// Function with default parameter
const greet = (name = "World") => \`Hello, \${name}!\`;
\`\`\`

## Conditionals

\`\`\`javascript
if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else {
  console.log("C");
}

// Ternary operator
const message = isLoggedIn ? "Welcome!" : "Please log in";
\`\`\`

## Loops

\`\`\`javascript
// for loop
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// for...of (arrays)
for (const fruit of fruits) {
  console.log(fruit);
}

// forEach
fruits.forEach((fruit) => {
  console.log(fruit);
});
\`\`\``,
            xpReward: 15,
          },
          {
            orderIndex: 1,
            title: "Arrays and Objects",
            type: "concept",
            content: `# Arrays and Objects

Arrays and objects are essential for managing data in JavaScript.

## Array Methods

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];

// Add elements
numbers.push(6);           // Add to end: [1,2,3,4,5,6]
numbers.unshift(0);        // Add to start: [0,1,2,3,4,5,6]

// Remove elements
numbers.pop();             // Remove from end
numbers.shift();           // Remove from start

// Find elements
numbers.indexOf(3);        // Returns index: 2
numbers.includes(3);       // Returns boolean: true
numbers.find(n => n > 3);  // Returns first match: 4

// Transform arrays
numbers.map(n => n * 2);       // [2,4,6,8,10]
numbers.filter(n => n > 2);    // [3,4,5]
numbers.reduce((sum, n) => sum + n, 0);  // 15

// Other useful methods
numbers.slice(1, 3);       // [2,3] (doesn't modify original)
numbers.splice(1, 2);      // Removes 2 items starting at index 1
numbers.reverse();         // Reverses the array
numbers.sort();            // Sorts the array
\`\`\`

## Spread Operator

\`\`\`javascript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// Combine arrays
const combined = [...arr1, ...arr2];  // [1,2,3,4,5,6]

// Copy array
const copy = [...arr1];

// Add to array immutably
const newArr = [...arr1, 4];  // [1,2,3,4]
\`\`\`

## Objects

\`\`\`javascript
const user = {
  name: "Alice",
  age: 25,
  email: "alice@example.com"
};

// Access properties
user.name;         // "Alice"
user["email"];     // "alice@example.com"

// Add/modify properties
user.role = "admin";
user.age = 26;

// Object methods
Object.keys(user);    // ["name", "age", "email", "role"]
Object.values(user);  // ["Alice", 26, "alice@example.com", "admin"]
Object.entries(user); // [["name", "Alice"], ...]
\`\`\`

## Destructuring

\`\`\`javascript
// Array destructuring
const [first, second] = [1, 2, 3];

// Object destructuring
const { name, age } = user;

// With rename
const { name: userName } = user;

// With default value
const { role = "user" } = user;
\`\`\`

## Spread with Objects

\`\`\`javascript
const user = { name: "Alice", age: 25 };

// Copy object
const copy = { ...user };

// Merge objects
const updated = { ...user, age: 26 };

// Add properties
const withRole = { ...user, role: "admin" };
\`\`\``,
            xpReward: 15,
          },
          {
            orderIndex: 2,
            title: "Array Methods Exercise",
            type: "exercise",
            content: "Practice using array methods with practical examples.",
            xpReward: 20,
            exercise: {
              instructions: `Complete these array method exercises:

1. Use filter() to get only completed todos
2. Use map() to get an array of todo texts
3. Use find() to find a todo by its id
4. Use some() to check if any todo is completed
5. Use reduce() to count completed todos`,
              starterCode: {
                javascript: `const todos = [
  { id: 1, text: "Learn JavaScript", completed: true },
  { id: 2, text: "Build a project", completed: false },
  { id: 3, text: "Review code", completed: true },
  { id: 4, text: "Write tests", completed: false }
];

// 1. Get completed todos
const completedTodos = // your code here

// 2. Get array of todo texts
const todoTexts = // your code here

// 3. Find todo with id 3
const todoById = // your code here

// 4. Check if any todo is completed
const hasCompleted = // your code here

// 5. Count completed todos
const completedCount = // your code here`,
              },
              solution: {
                javascript: `const todos = [
  { id: 1, text: "Learn JavaScript", completed: true },
  { id: 2, text: "Build a project", completed: false },
  { id: 3, text: "Review code", completed: true },
  { id: 4, text: "Write tests", completed: false }
];

// 1. Get completed todos
const completedTodos = todos.filter(todo => todo.completed);

// 2. Get array of todo texts
const todoTexts = todos.map(todo => todo.text);

// 3. Find todo with id 3
const todoById = todos.find(todo => todo.id === 3);

// 4. Check if any todo is completed
const hasCompleted = todos.some(todo => todo.completed);

// 5. Count completed todos
const completedCount = todos.reduce((count, todo) => {
  return todo.completed ? count + 1 : count;
}, 0);`,
              },
              testCases: [
                { input: "completedTodos.length", expectedOutput: "2" },
                { input: "todoTexts[0]", expectedOutput: "Learn JavaScript" },
                { input: "todoById.text", expectedOutput: "Review code" },
              ],
            },
          },
          {
            orderIndex: 3,
            title: "DOM Manipulation",
            type: "concept",
            content: `# DOM Manipulation

The DOM (Document Object Model) lets JavaScript interact with HTML.

## Selecting Elements

\`\`\`javascript
// By ID
const header = document.getElementById("header");

// By class
const items = document.getElementsByClassName("item");

// By selector (recommended)
const header = document.querySelector("#header");
const items = document.querySelectorAll(".item");
const button = document.querySelector("button[type='submit']");
\`\`\`

## Modifying Elements

\`\`\`javascript
const element = document.querySelector("#myElement");

// Text content
element.textContent = "New text";

// HTML content
element.innerHTML = "<strong>Bold text</strong>";

// Attributes
element.setAttribute("class", "highlight");
element.getAttribute("id");
element.removeAttribute("disabled");

// Classes
element.classList.add("active");
element.classList.remove("hidden");
element.classList.toggle("visible");
element.classList.contains("active");

// Styles
element.style.color = "blue";
element.style.backgroundColor = "#f0f0f0";
\`\`\`

## Creating Elements

\`\`\`javascript
// Create element
const div = document.createElement("div");
div.textContent = "Hello!";
div.className = "greeting";

// Add to page
document.body.appendChild(div);

// Insert at specific position
parent.insertBefore(newElement, referenceElement);

// Remove element
element.remove();
// or
parent.removeChild(element);
\`\`\`

## Event Listeners

\`\`\`javascript
const button = document.querySelector("button");

// Add event listener
button.addEventListener("click", (event) => {
  console.log("Button clicked!");
  console.log(event.target); // The clicked element
});

// Common events
"click"        // Mouse click
"submit"       // Form submission
"input"        // Input value changed
"change"       // Input value changed (on blur)
"keydown"      // Key pressed
"keyup"        // Key released

// Remove event listener
button.removeEventListener("click", handleClick);
\`\`\`

## Event Delegation

\`\`\`javascript
// Instead of adding listeners to each item
// Add one listener to the parent
document.querySelector("#todo-list").addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const todoItem = e.target.closest(".todo-item");
    todoItem.remove();
  }
});
\`\`\`

## Prevent Default

\`\`\`javascript
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Stop form from refreshing page
  // Handle form submission
});
\`\`\``,
            xpReward: 15,
          },
          {
            orderIndex: 4,
            title: "Build Todo Functionality",
            type: "exercise",
            content: "Implement the JavaScript functionality for our Todo app.",
            xpReward: 30,
            exercise: {
              instructions: `Implement the core Todo app functionality:

1. Get references to DOM elements (form, input, list)
2. Create an array to store todos
3. Implement addTodo() function that:
   - Creates a new todo object
   - Adds it to the array
   - Renders the todo to the DOM
4. Implement toggleTodo() function
5. Implement deleteTodo() function
6. Add event listener for form submission`,
              starterCode: {
                javascript: `// DOM Elements
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");

// State
let todos = [];

// Generate unique ID
function generateId() {
  return Date.now().toString();
}

// Add Todo
function addTodo(text) {
  // TODO: Create todo object
  // TODO: Add to todos array
  // TODO: Render the todo
}

// Toggle Todo
function toggleTodo(id) {
  // TODO: Find todo and toggle completed
  // TODO: Update the DOM
}

// Delete Todo
function deleteTodo(id) {
  // TODO: Remove from array
  // TODO: Remove from DOM
}

// Render Todo
function renderTodo(todo) {
  // TODO: Create list item element
  // TODO: Add checkbox, text, delete button
  // TODO: Append to list
}

// Event Listeners
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // TODO: Get input value
  // TODO: Call addTodo
  // TODO: Clear input
});`,
              },
              solution: {
                javascript: `// DOM Elements
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");

// State
let todos = [];

// Generate unique ID
function generateId() {
  return Date.now().toString();
}

// Add Todo
function addTodo(text) {
  const todo = {
    id: generateId(),
    text,
    completed: false,
    createdAt: new Date()
  };
  todos.push(todo);
  renderTodo(todo);
}

// Toggle Todo
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    const item = document.querySelector(\`[data-id="\${id}"]\`);
    item.classList.toggle("completed");
    item.querySelector("input").checked = todo.completed;
  }
}

// Delete Todo
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  const item = document.querySelector(\`[data-id="\${id}"]\`);
  item.remove();
}

// Render Todo
function renderTodo(todo) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = todo.id;

  li.innerHTML = \`
    <input type="checkbox" \${todo.completed ? "checked" : ""}>
    <span class="todo-text">\${todo.text}</span>
    <button class="delete-btn">Delete</button>
  \`;

  // Event listeners
  li.querySelector("input").addEventListener("change", () => toggleTodo(todo.id));
  li.querySelector(".delete-btn").addEventListener("click", () => deleteTodo(todo.id));

  todoList.appendChild(li);
}

// Event Listeners
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (text) {
    addTodo(text);
    todoInput.value = "";
    todoInput.focus();
  }
});`,
              },
              testCases: [
                { input: "addTodo('Test')", expectedOutput: "todos.length === 1" },
                { input: "toggleTodo", expectedOutput: "function exists" },
              ],
            },
          },
          {
            orderIndex: 5,
            title: "JavaScript Quiz",
            type: "quiz",
            content: "Test your JavaScript knowledge.",
            xpReward: 20,
            quiz: {
              questions: [
                {
                  question: "What's the difference between == and === in JavaScript?",
                  options: [
                    "No difference",
                    "=== checks type and value, == only checks value",
                    "== is faster",
                    "=== works only with strings",
                  ],
                  correctIndex: 1,
                  explanation: "=== is strict equality (checks type and value), while == performs type coercion before comparing.",
                },
                {
                  question: "Which array method creates a new array with transformed elements?",
                  options: ["forEach", "filter", "map", "reduce"],
                  correctIndex: 2,
                  explanation: "map() creates a new array by transforming each element using the provided function.",
                },
                {
                  question: "What does e.preventDefault() do in an event handler?",
                  options: [
                    "Stops the event from bubbling",
                    "Prevents the default browser behavior",
                    "Deletes the element",
                    "Refreshes the page",
                  ],
                  correctIndex: 1,
                  explanation: "preventDefault() stops the browser's default action (like form submission refreshing the page).",
                },
                {
                  question: "What is the correct way to add an element to the end of an array?",
                  options: ["array.add(item)", "array.push(item)", "array.append(item)", "array.insert(item)"],
                  correctIndex: 1,
                  explanation: "push() adds one or more elements to the end of an array and returns the new length.",
                },
              ],
            },
          },
        ],
      },
      {
        orderIndex: 3,
        title: "React Fundamentals",
        description: "Transform your app using React. Learn components, props, state, and hooks.",
        deliverable: "Todo app rebuilt with React components",
        xpReward: 125,
        lessons: [
          {
            orderIndex: 0,
            title: "Introduction to React",
            type: "concept",
            content: `# Introduction to React

React is a JavaScript library for building user interfaces.

## Why React?

1. **Component-Based**: Build encapsulated components that manage their own state
2. **Declarative**: Describe what you want, React handles the how
3. **Virtual DOM**: Efficient updates by comparing changes
4. **Rich Ecosystem**: Huge community and tool support

## Creating a React App

\`\`\`bash
npx create-react-app todo-app --template typescript
cd todo-app
npm start
\`\`\`

## JSX

JSX lets you write HTML-like syntax in JavaScript:

\`\`\`jsx
const element = <h1>Hello, World!</h1>;

// With expressions
const name = "Alice";
const greeting = <h1>Hello, {name}!</h1>;

// With attributes
const link = <a href="https://example.com">Click me</a>;

// Multiple elements need a wrapper
const content = (
  <div>
    <h1>Title</h1>
    <p>Paragraph</p>
  </div>
);
\`\`\`

## Components

Components are reusable building blocks:

\`\`\`jsx
// Function component
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Using the component
<Welcome name="Alice" />
\`\`\`

## Props

Props pass data to components:

\`\`\`jsx
function UserCard({ name, age, isAdmin }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>Age: {age}</p>
      {isAdmin && <span>Admin</span>}
    </div>
  );
}

// Usage
<UserCard name="Alice" age={25} isAdmin={true} />
\`\`\`

## Conditional Rendering

\`\`\`jsx
function Greeting({ isLoggedIn }) {
  // Using if
  if (isLoggedIn) {
    return <h1>Welcome back!</h1>;
  }
  return <h1>Please sign in</h1>;
}

// Using ternary
function Status({ count }) {
  return <p>{count > 0 ? \`\${count} items\` : "No items"}</p>;
}

// Using &&
function Admin({ isAdmin }) {
  return <div>{isAdmin && <AdminPanel />}</div>;
}
\`\`\`

## Lists

\`\`\`jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
\`\`\`

Always use unique **keys** when rendering lists!`,
            xpReward: 15,
          },
          {
            orderIndex: 1,
            title: "State with useState",
            type: "concept",
            content: `# State with useState

State lets components "remember" things and update the UI.

## The useState Hook

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  // Declare state variable 'count' with initial value 0
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

## State Rules

1. **Call at top level**: Don't call in loops, conditions, or nested functions
2. **Only in React functions**: Use in components or custom hooks
3. **State is per component**: Each component instance has its own state

## Updating State

\`\`\`jsx
// Direct update
setCount(5);

// Update based on previous state
setCount(prevCount => prevCount + 1);

// Object state
const [user, setUser] = useState({ name: '', age: 0 });
setUser({ ...user, name: 'Alice' }); // Spread to keep other properties

// Array state
const [items, setItems] = useState([]);
setItems([...items, newItem]); // Add item
setItems(items.filter(item => item.id !== id)); // Remove item
\`\`\`

## Multiple State Variables

\`\`\`jsx
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Each has its own setter
}
\`\`\`

## State vs Props

| Props | State |
|-------|-------|
| Passed from parent | Managed within component |
| Read-only | Can be updated |
| For configuration | For dynamic data |

## Lifting State Up

When siblings need to share state, lift it to their parent:

\`\`\`jsx
function Parent() {
  const [value, setValue] = useState('');

  return (
    <>
      <Input value={value} onChange={setValue} />
      <Display value={value} />
    </>
  );
}
\`\`\``,
            xpReward: 15,
          },
          {
            orderIndex: 2,
            title: "Build React Todo Component",
            type: "exercise",
            content: "Create React components for the Todo app.",
            xpReward: 30,
            exercise: {
              instructions: `Create the main React components for our Todo app:

1. Create a TodoItem component that displays a single todo
2. Create a TodoList component that renders multiple TodoItems
3. Create an AddTodo component with form handling
4. Wire them together in the App component with state`,
              starterCode: {
                typescript: `import { useState } from 'react';

// Types
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// TodoItem Component
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  // TODO: Implement component
  return null;
}

// TodoList Component
interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  // TODO: Implement component
  return null;
}

// AddTodo Component
interface AddTodoProps {
  onAdd: (text: string) => void;
}

function AddTodo({ onAdd }: AddTodoProps) {
  // TODO: Implement component with useState
  return null;
}

// App Component
function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    // TODO: Implement
  };

  const toggleTodo = (id: string) => {
    // TODO: Implement
  };

  const deleteTodo = (id: string) => {
    // TODO: Implement
  };

  return (
    <div className="app">
      {/* TODO: Render components */}
    </div>
  );
}

export default App;`,
              },
              solution: {
                typescript: `import { useState } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={\`todo-item \${todo.completed ? 'completed' : ''}\`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span className="todo-text">{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="empty">No todos yet. Add one above!</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

interface AddTodoProps {
  onAdd: (text: string) => void;
}

function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-todo">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
      />
      <button type="submit">Add</button>
    </form>
  );
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="app">
      <h1>Todo App</h1>
      <AddTodo onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      <footer>
        <span>{todos.filter((t) => !t.completed).length} items left</span>
      </footer>
    </div>
  );
}

export default App;`,
              },
              testCases: [
                { input: "TodoItem", expectedOutput: "component exists" },
                { input: "useState", expectedOutput: "hook used" },
              ],
            },
          },
          {
            orderIndex: 3,
            title: "useEffect and Side Effects",
            type: "concept",
            content: `# useEffect and Side Effects

useEffect lets you perform side effects in function components.

## What are Side Effects?

- Fetching data
- Subscriptions
- Manually changing the DOM
- Timers
- Local storage

## Basic useEffect

\`\`\`jsx
import { useEffect, useState } from 'react';

function Component() {
  const [count, setCount] = useState(0);

  // Runs after every render
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  });

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
\`\`\`

## Dependency Array

\`\`\`jsx
// Runs only once on mount
useEffect(() => {
  console.log('Component mounted');
}, []);

// Runs when 'value' changes
useEffect(() => {
  console.log('Value changed:', value);
}, [value]);

// Runs when any dependency changes
useEffect(() => {
  console.log('Something changed');
}, [value1, value2]);
\`\`\`

## Cleanup Function

\`\`\`jsx
useEffect(() => {
  // Setup
  const subscription = subscribe();

  // Cleanup (runs on unmount or before next effect)
  return () => {
    subscription.unsubscribe();
  };
}, []);
\`\`\`

## Data Fetching

\`\`\`jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(\`/api/users/\${userId}\`);
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]); // Re-fetch when userId changes

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <div>{user.name}</div>;
}
\`\`\`

## Local Storage Example

\`\`\`jsx
function useTodos() {
  const [todos, setTodos] = useState(() => {
    // Lazy initialization
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage when todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  return [todos, setTodos];
}
\`\`\``,
            xpReward: 20,
          },
          {
            orderIndex: 4,
            title: "React Quiz",
            type: "quiz",
            content: "Test your React knowledge.",
            xpReward: 20,
            quiz: {
              questions: [
                {
                  question: "What is the purpose of the key prop when rendering lists?",
                  options: [
                    "It's required by JavaScript",
                    "It helps React identify which items changed, added, or removed",
                    "It styles the list items",
                    "It sorts the list",
                  ],
                  correctIndex: 1,
                  explanation: "Keys help React identify which items have changed, been added, or removed, enabling efficient updates.",
                },
                {
                  question: "When does useEffect with an empty dependency array run?",
                  options: [
                    "On every render",
                    "Only on mount (component first appears)",
                    "Never",
                    "Only when props change",
                  ],
                  correctIndex: 1,
                  explanation: "useEffect with [] runs only once when the component mounts, similar to componentDidMount.",
                },
                {
                  question: "How do you update state based on the previous state value?",
                  options: [
                    "setCount(count + 1)",
                    "setCount(prev => prev + 1)",
                    "count = count + 1",
                    "this.setState({ count: count + 1 })",
                  ],
                  correctIndex: 1,
                  explanation: "Using a function ensures you're working with the latest state value, avoiding race conditions.",
                },
                {
                  question: "What is JSX?",
                  options: [
                    "A new programming language",
                    "A syntax extension for JavaScript that looks like HTML",
                    "A CSS framework",
                    "A database query language",
                  ],
                  correctIndex: 1,
                  explanation: "JSX is a syntax extension that allows you to write HTML-like code in JavaScript, making React components more readable.",
                },
              ],
            },
          },
        ],
      },
      {
        orderIndex: 4,
        title: "Backend Development",
        description: "Build the server-side of your application with Node.js, Express, and PostgreSQL.",
        deliverable: "Complete REST API with database integration",
        xpReward: 150,
        lessons: [
          {
            orderIndex: 0,
            title: "Introduction to Node.js",
            type: "concept",
            content: `# Introduction to Node.js

Node.js lets you run JavaScript on the server.

## What is Node.js?

- JavaScript runtime built on Chrome's V8 engine
- Event-driven, non-blocking I/O
- Perfect for APIs, real-time applications

## Creating a Node.js Project

\`\`\`bash
mkdir todo-api
cd todo-api
npm init -y
\`\`\`

## Package.json

\`\`\`json
{
  "name": "todo-api",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {}
}
\`\`\`

## Your First Server

\`\`\`javascript
// index.js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
\`\`\`

## Express.js

Express is a minimal web framework that simplifies building APIs:

\`\`\`bash
npm install express
\`\`\`

\`\`\`javascript
const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const todo = req.body;
  todos.push(todo);
  res.status(201).json(todo);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## HTTP Methods

- **GET** - Read data
- **POST** - Create data
- **PUT** - Update data (full)
- **PATCH** - Update data (partial)
- **DELETE** - Delete data

## Request & Response

\`\`\`javascript
app.post('/api/todos', (req, res) => {
  // Request
  console.log(req.body);       // POST body
  console.log(req.params);     // URL params (:id)
  console.log(req.query);      // Query string (?key=value)
  console.log(req.headers);    // HTTP headers

  // Response
  res.status(201);             // Set status code
  res.json({ data: 'value' }); // Send JSON
  res.send('text');            // Send text
});
\`\`\``,
            xpReward: 20,
          },
          {
            orderIndex: 1,
            title: "Building REST APIs",
            type: "concept",
            content: `# Building REST APIs

REST (Representational State Transfer) is an architectural style for APIs.

## REST Principles

1. **Stateless**: Each request contains all needed information
2. **Resource-Based**: URLs represent resources
3. **HTTP Methods**: Use proper methods for operations
4. **JSON**: Standard data format

## RESTful Routes

For a "todos" resource:

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | /api/todos | Get all todos |
| GET | /api/todos/:id | Get one todo |
| POST | /api/todos | Create todo |
| PUT | /api/todos/:id | Update todo |
| DELETE | /api/todos/:id | Delete todo |

## Express Router

Organize routes into separate files:

\`\`\`javascript
// routes/todos.js
const express = require('express');
const router = express.Router();

let todos = [];

router.get('/', (req, res) => {
  res.json(todos);
});

router.get('/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(todo);
});

router.post('/', (req, res) => {
  const todo = {
    id: Date.now().toString(),
    ...req.body,
    completed: false
  };
  todos.push(todo);
  res.status(201).json(todo);
});

router.put('/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  todos[index] = { ...todos[index], ...req.body };
  res.json(todos[index]);
});

router.delete('/:id', (req, res) => {
  todos = todos.filter(t => t.id !== req.params.id);
  res.status(204).send();
});

module.exports = router;
\`\`\`

## Using the Router

\`\`\`javascript
// index.js
const express = require('express');
const todoRoutes = require('./routes/todos');

const app = express();
app.use(express.json());
app.use('/api/todos', todoRoutes);

app.listen(3000);
\`\`\`

## Error Handling

\`\`\`javascript
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
\`\`\`

## CORS

Enable cross-origin requests:

\`\`\`javascript
const cors = require('cors');
app.use(cors());
\`\`\``,
            xpReward: 20,
          },
          {
            orderIndex: 2,
            title: "Build Todo API",
            type: "exercise",
            content: "Create a complete REST API for todos.",
            xpReward: 35,
            exercise: {
              instructions: `Build a complete Todo REST API with Express:

1. Set up Express with JSON middleware and CORS
2. Implement GET /api/todos - return all todos
3. Implement POST /api/todos - create a new todo
4. Implement PUT /api/todos/:id - update a todo
5. Implement DELETE /api/todos/:id - delete a todo
6. Add proper error handling and status codes`,
              starterCode: {
                javascript: `const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let todos = [];

// TODO: Implement routes

// GET /api/todos

// POST /api/todos

// PUT /api/todos/:id

// DELETE /api/todos/:id

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
              },
              solution: {
                javascript: `const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

let todos = [];

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Create todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const todo = {
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(todo);
  res.status(201).json(todo);
});

// Update todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  const index = todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos[index] = {
    ...todos[index],
    ...(text !== undefined && { text }),
    ...(completed !== undefined && { completed })
  };

  res.json(todos[index]);
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(index, 1);
  res.status(204).send();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
              },
              testCases: [
                { input: "GET /api/todos", expectedOutput: "200 []" },
                { input: "POST /api/todos", expectedOutput: "201" },
              ],
            },
          },
          {
            orderIndex: 3,
            title: "Database with PostgreSQL",
            type: "concept",
            content: `# Database with PostgreSQL

PostgreSQL is a powerful, open-source relational database.

## Why PostgreSQL?

- ACID compliant (reliable transactions)
- Rich data types (JSON, arrays, etc.)
- Excellent performance
- Free and open-source

## Setting Up

\`\`\`bash
# Install PostgreSQL (varies by OS)
# Create database
createdb todo_app
\`\`\`

## Prisma ORM

Prisma makes database work easy:

\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

## Prisma Schema

\`\`\`prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Todo {
  id        String   @id @default(cuid())
  text      String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
\`\`\`

## Migrations

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

## Using Prisma

\`\`\`javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create
const todo = await prisma.todo.create({
  data: { text: 'Learn Prisma' }
});

// Read all
const todos = await prisma.todo.findMany();

// Read one
const todo = await prisma.todo.findUnique({
  where: { id: 'some-id' }
});

// Update
const updated = await prisma.todo.update({
  where: { id: 'some-id' },
  data: { completed: true }
});

// Delete
await prisma.todo.delete({
  where: { id: 'some-id' }
});
\`\`\`

## Filtering and Sorting

\`\`\`javascript
// Filter
const activeTodos = await prisma.todo.findMany({
  where: { completed: false }
});

// Sort
const sortedTodos = await prisma.todo.findMany({
  orderBy: { createdAt: 'desc' }
});

// Pagination
const page = await prisma.todo.findMany({
  skip: 10,
  take: 10
});
\`\`\``,
            xpReward: 25,
          },
          {
            orderIndex: 4,
            title: "Backend Quiz",
            type: "quiz",
            content: "Test your backend development knowledge.",
            xpReward: 20,
            quiz: {
              questions: [
                {
                  question: "Which HTTP status code indicates a resource was successfully created?",
                  options: ["200 OK", "201 Created", "204 No Content", "301 Redirect"],
                  correctIndex: 1,
                  explanation: "201 Created indicates that a new resource has been successfully created as a result of the request.",
                },
                {
                  question: "What does REST stand for?",
                  options: [
                    "Representational State Transfer",
                    "Remote Server Transfer",
                    "Request State Technology",
                    "Relational System Transfer",
                  ],
                  correctIndex: 0,
                  explanation: "REST stands for Representational State Transfer, an architectural style for designing APIs.",
                },
                {
                  question: "Which HTTP method should be used to update an existing resource?",
                  options: ["GET", "POST", "PUT or PATCH", "DELETE"],
                  correctIndex: 2,
                  explanation: "PUT replaces the entire resource, while PATCH updates specific fields. Both are used for updates.",
                },
                {
                  question: "What is the purpose of CORS?",
                  options: [
                    "To encrypt data",
                    "To allow cross-origin requests between different domains",
                    "To compress responses",
                    "To cache API responses",
                  ],
                  correctIndex: 1,
                  explanation: "CORS (Cross-Origin Resource Sharing) allows servers to specify which origins can access their resources.",
                },
              ],
            },
          },
        ],
      },
      {
        orderIndex: 5,
        title: "Full Stack Integration",
        description: "Connect your React frontend to your Node.js backend. Learn API calls, authentication, and deployment.",
        deliverable: "Fully integrated full-stack Todo application",
        xpReward: 125,
        lessons: [
          {
            orderIndex: 0,
            title: "Connecting Frontend to Backend",
            type: "concept",
            content: `# Connecting Frontend to Backend

Now let's connect our React app to our Express API.

## Fetch API

\`\`\`javascript
// GET request
const response = await fetch('http://localhost:3001/api/todos');
const todos = await response.json();

// POST request
const response = await fetch('http://localhost:3001/api/todos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text: 'New todo' }),
});
const newTodo = await response.json();
\`\`\`

## Custom Hook for API

\`\`\`typescript
function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:3001/api/todos';

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (text: string) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    const res = await fetch(\`\${API_URL}/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo?.completed }),
    });
    const updated = await res.json();
    setTodos(todos.map(t => t.id === id ? updated : t));
  };

  const deleteTodo = async (id: string) => {
    await fetch(\`\${API_URL}/\${id}\`, { method: 'DELETE' });
    setTodos(todos.filter(t => t.id !== id));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return { todos, loading, error, addTodo, toggleTodo, deleteTodo };
}
\`\`\`

## Environment Variables

\`\`\`
# .env.local
REACT_APP_API_URL=http://localhost:3001/api
\`\`\`

\`\`\`javascript
const API_URL = process.env.REACT_APP_API_URL;
\`\`\`

## Error Handling

\`\`\`javascript
const addTodo = async (text: string) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error('Failed to create todo');
    }

    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
  } catch (err) {
    setError(err.message);
  }
};
\`\`\``,
            xpReward: 20,
          },
          {
            orderIndex: 1,
            title: "User Authentication",
            type: "concept",
            content: `# User Authentication

Secure your app with user authentication.

## JWT (JSON Web Tokens)

JWTs are a secure way to authenticate users:

\`\`\`
Header.Payload.Signature
\`\`\`

## Backend: Register & Login

\`\`\`javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: { email, password: hashedPassword }
  });

  // Generate token
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user.id, email } });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, email } });
});
\`\`\`

## Auth Middleware

\`\`\`javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected route
app.get('/api/todos', authMiddleware, async (req, res) => {
  const todos = await prisma.todo.findMany({
    where: { userId: req.userId }
  });
  res.json(todos);
});
\`\`\`

## Frontend: Auth Context

\`\`\`typescript
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
\`\`\``,
            xpReward: 25,
          },
          {
            orderIndex: 2,
            title: "Deployment",
            type: "concept",
            content: `# Deployment

Let's deploy our full-stack application!

## Frontend: Vercel

Vercel is perfect for React/Next.js apps:

1. Push code to GitHub
2. Go to vercel.com and import your repo
3. Configure environment variables
4. Deploy!

\`\`\`bash
# Or use CLI
npm i -g vercel
vercel
\`\`\`

## Backend: Railway

Railway makes backend deployment easy:

1. Go to railway.app
2. Create new project from GitHub
3. Add PostgreSQL database
4. Set environment variables
5. Deploy!

## Environment Variables

### Frontend (.env.production)
\`\`\`
REACT_APP_API_URL=https://your-api.railway.app/api
\`\`\`

### Backend (Railway)
\`\`\`
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-app.vercel.app
\`\`\`

## CORS Configuration

Update CORS for production:

\`\`\`javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
\`\`\`

## Database Migrations

\`\`\`bash
# Run migrations in production
npx prisma migrate deploy
\`\`\`

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Update CORS origins
- [ ] Run database migrations
- [ ] Test API endpoints
- [ ] Test frontend API calls
- [ ] Check error handling
- [ ] Enable HTTPS

## Monitoring

- Use Railway logs for backend
- Use Vercel analytics for frontend
- Set up error tracking (Sentry)`,
            xpReward: 20,
          },
          {
            orderIndex: 3,
            title: "Integration Quiz",
            type: "quiz",
            content: "Test your full-stack integration knowledge.",
            xpReward: 20,
            quiz: {
              questions: [
                {
                  question: "What header is typically used to send JWT tokens?",
                  options: [
                    "X-Auth-Token",
                    "Authorization: Bearer <token>",
                    "Cookie",
                    "Token",
                  ],
                  correctIndex: 1,
                  explanation: "The Authorization header with 'Bearer' prefix is the standard way to send JWT tokens.",
                },
                {
                  question: "Why should passwords be hashed before storing?",
                  options: [
                    "To make them shorter",
                    "To encrypt them for later decryption",
                    "So plain text passwords aren't exposed if database is breached",
                    "To improve login speed",
                  ],
                  correctIndex: 2,
                  explanation: "Hashing protects passwords so that even if the database is compromised, actual passwords remain unknown.",
                },
                {
                  question: "What is the purpose of environment variables?",
                  options: [
                    "To make code run faster",
                    "To store configuration that varies between environments",
                    "To compress the application",
                    "To debug the application",
                  ],
                  correctIndex: 1,
                  explanation: "Environment variables store configuration like API URLs and secrets that differ between development and production.",
                },
              ],
            },
          },
        ],
      },
      {
        orderIndex: 6,
        title: "Final Project & Certification",
        description: "Complete your capstone project and earn your Full Stack Fundamentals certification.",
        deliverable: "Deployed full-stack Todo application with all features",
        xpReward: 175,
        lessons: [
          {
            orderIndex: 0,
            title: "Capstone Requirements",
            type: "concept",
            content: `# Capstone Project Requirements

Congratulations on reaching the final phase! Your capstone project will demonstrate everything you've learned.

## Requirements

Your deployed Todo application must include:

### Frontend (React)
- [ ] User registration and login
- [ ] Create, read, update, delete todos
- [ ] Mark todos as complete/incomplete
- [ ] Filter todos (All, Active, Completed)
- [ ] Responsive design
- [ ] Loading and error states
- [ ] Form validation

### Backend (Node.js/Express)
- [ ] RESTful API endpoints
- [ ] User authentication with JWT
- [ ] Protected routes
- [ ] Input validation
- [ ] Error handling

### Database (PostgreSQL)
- [ ] User model
- [ ] Todo model with user relationship
- [ ] Proper indexes

### Deployment
- [ ] Frontend deployed (Vercel)
- [ ] Backend deployed (Railway)
- [ ] Production database
- [ ] HTTPS enabled

## Bonus Features

Add any of these for extra XP:
- Dark mode toggle
- Due dates for todos
- Categories/tags
- Search functionality
- Drag-and-drop reordering
- Email verification
- Password reset

## Submission

1. Deploy your application
2. Submit the following URLs:
   - Frontend URL
   - GitHub repository (public)
   - API documentation (optional)

## Evaluation Criteria

| Criteria | Points |
|----------|--------|
| All features working | 40 |
| Code quality | 20 |
| UI/UX design | 15 |
| Error handling | 10 |
| Documentation | 10 |
| Bonus features | 5 |

## Timeline

You have access to all resources. Take your time to build something you're proud of!

Good luck! 🚀`,
            xpReward: 10,
          },
          {
            orderIndex: 1,
            title: "Project Submission",
            type: "exercise",
            content: "Submit your completed capstone project.",
            xpReward: 100,
            exercise: {
              instructions: `Submit your completed Full Stack Todo Application:

1. Ensure all required features are implemented
2. Deploy your frontend to Vercel
3. Deploy your backend to Railway
4. Make your GitHub repository public
5. Fill in the submission form below

Your project will be reviewed and you'll receive feedback and your certification upon approval.`,
              starterCode: {
                markdown: `# Capstone Submission

## Project URLs

Frontend URL:
GitHub Repository:
Backend API URL:

## Features Implemented

- [ ] User registration
- [ ] User login
- [ ] Create todos
- [ ] Read todos
- [ ] Update todos
- [ ] Delete todos
- [ ] Mark complete
- [ ] Filter todos
- [ ] Responsive design

## Bonus Features (if any)

-

## Challenges Faced

Describe any challenges you faced and how you overcame them:



## What I Learned

Describe what you learned through this project:

`,
              },
              solution: {
                markdown: `Submission completed - project URLs provided and features verified.`,
              },
              testCases: [
                { input: "frontend URL", expectedOutput: "valid URL" },
                { input: "github URL", expectedOutput: "valid URL" },
              ],
            },
          },
          {
            orderIndex: 2,
            title: "What's Next?",
            type: "concept",
            content: `# What's Next?

🎉 **Congratulations!** You've completed the Full Stack Fundamentals path!

## Your Achievements

- ✅ Built a complete web application from scratch
- ✅ Learned HTML, CSS, and JavaScript
- ✅ Mastered React for building UIs
- ✅ Created a Node.js/Express backend
- ✅ Worked with PostgreSQL databases
- ✅ Deployed to production

## Continue Your Journey

### Intermediate Paths

**1. Advanced React**
- React Router
- State management (Redux, Zustand)
- Performance optimization
- Testing

**2. Backend Mastery**
- Authentication strategies
- API security
- Caching with Redis
- Message queues

**3. DevOps Fundamentals**
- Docker containers
- CI/CD pipelines
- Monitoring
- Logging

### More Projects to Build

1. **Blog Platform** - Full CRUD with rich text editing
2. **E-commerce Store** - Payments, cart, orders
3. **Real-time Chat** - WebSockets, notifications
4. **Dashboard App** - Data visualization, charts

## Resources

- [MDN Web Docs](https://developer.mozilla.org)
- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org/docs)
- [Prisma Documentation](https://prisma.io/docs)

## Community

Join our Discord to:
- Get help from other learners
- Share your projects
- Find study partners
- Stay updated on new content

**Keep building, keep learning!** 🚀`,
            xpReward: 25,
          },
        ],
      },
    ],
  },
];

const projects: ProjectData[] = [
  // Todo App - Beginner Project
  {
    slug: "todo-app",
    title: "Todo App",
    description: "Build a full-featured todo application with React and TypeScript. Learn state management, component composition, and local storage persistence.",
    difficulty: "beginner",
    techStack: ["React", "TypeScript", "Tailwind CSS", "Local Storage"],
    estimatedHours: 8,
    xpReward: 150,
    skills: ["React Components", "State Management", "TypeScript Basics", "CSS Styling", "Local Storage"],
    milestones: [
      {
        orderIndex: 0,
        title: "Project Setup",
        description: "Set up the initial project structure with React and TypeScript.",
        instructions: `In this milestone, you'll set up the basic project structure.

Create the following:
1. A main App component that will hold our todo application
2. Basic TypeScript interfaces for our Todo type
3. A simple header component

The Todo interface should have:
- id: string
- text: string
- completed: boolean
- createdAt: Date`,
        requirements: [
          "Create a Todo interface with id, text, completed, and createdAt fields",
          "Create an App component that renders a header",
          "Set up basic styling with Tailwind CSS",
        ],
        starterFiles: {
          "App.tsx": `import React from 'react';

// TODO: Define Todo interface here

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* TODO: Add header */}
      <h1>Todo App</h1>
    </div>
  );
}

export default App;`,
          "types.ts": `// TODO: Define your Todo interface here
`,
        },
        testCriteria: [
          { type: "contains", target: "types.ts", value: "interface Todo", description: "Todo interface defined" },
          { type: "contains", target: "App.tsx", value: "Todo App", description: "App renders header" },
        ],
        xpReward: 15,
      },
      {
        orderIndex: 1,
        title: "Add Todo Form",
        description: "Create a form component to add new todos.",
        instructions: `Create an AddTodo component with:
1. An input field for the todo text
2. A submit button
3. Form handling with useState
4. Proper TypeScript typing for props

The component should accept an onAdd callback prop that receives the new todo text.`,
        requirements: [
          "Create AddTodo component with input and button",
          "Use useState to manage input value",
          "Call onAdd prop when form is submitted",
          "Clear input after submission",
        ],
        starterFiles: {
          "AddTodo.tsx": `import React, { useState } from 'react';

interface AddTodoProps {
  onAdd: (text: string) => void;
}

function AddTodo({ onAdd }: AddTodoProps) {
  // TODO: Implement the component
  return (
    <form>
      {/* TODO: Add input and button */}
    </form>
  );
}

export default AddTodo;`,
        },
        testCriteria: [
          { type: "contains", target: "AddTodo.tsx", value: "useState", description: "Uses useState hook" },
          { type: "contains", target: "AddTodo.tsx", value: "onAdd", description: "Calls onAdd callback" },
        ],
        xpReward: 20,
      },
      {
        orderIndex: 2,
        title: "Todo List Component",
        description: "Create a component to display the list of todos.",
        instructions: `Create a TodoList component that:
1. Accepts an array of todos as props
2. Renders each todo with a checkbox and text
3. Allows toggling completion status
4. Allows deleting todos

Also create a TodoItem component for individual items.`,
        requirements: [
          "Create TodoList component that maps over todos",
          "Create TodoItem component with checkbox and delete button",
          "Implement onToggle callback for completion",
          "Implement onDelete callback for removal",
        ],
        starterFiles: {
          "TodoList.tsx": `import React from 'react';
import { Todo } from './types';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  // TODO: Implement the component
  return (
    <ul>
      {/* TODO: Map over todos */}
    </ul>
  );
}

export default TodoList;`,
          "TodoItem.tsx": `import React from 'react';
import { Todo } from './types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  // TODO: Implement the component
  return (
    <li>
      {/* TODO: Add checkbox, text, and delete button */}
    </li>
  );
}

export default TodoItem;`,
        },
        testCriteria: [
          { type: "contains", target: "TodoList.tsx", value: "todos.map", description: "Maps over todos array" },
          { type: "contains", target: "TodoItem.tsx", value: "onToggle", description: "Has toggle functionality" },
          { type: "contains", target: "TodoItem.tsx", value: "onDelete", description: "Has delete functionality" },
        ],
        xpReward: 25,
      },
      {
        orderIndex: 3,
        title: "State Management",
        description: "Implement the main todo state management in App component.",
        instructions: `Update the App component to:
1. Manage todos state with useState
2. Implement addTodo function that creates new todos with unique IDs
3. Implement toggleTodo function to mark todos complete/incomplete
4. Implement deleteTodo function to remove todos

Use crypto.randomUUID() or Date.now() for generating unique IDs.`,
        requirements: [
          "Implement todos state with useState",
          "Create addTodo function that adds new todo to state",
          "Create toggleTodo function that toggles completion",
          "Create deleteTodo function that removes todo from state",
        ],
        starterFiles: {
          "App.tsx": `import React, { useState } from 'react';
import { Todo } from './types';
import AddTodo from './AddTodo';
import TodoList from './TodoList';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    // TODO: Implement
  };

  const toggleTodo = (id: string) => {
    // TODO: Implement
  };

  const deleteTodo = (id: string) => {
    // TODO: Implement
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Todo App</h1>
        <AddTodo onAdd={addTodo} />
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />
      </div>
    </div>
  );
}

export default App;`,
        },
        testCriteria: [
          { type: "contains", target: "App.tsx", value: "setTodos", description: "Updates todos state" },
          { type: "contains", target: "App.tsx", value: "addTodo", description: "Has addTodo function" },
          { type: "contains", target: "App.tsx", value: "toggleTodo", description: "Has toggleTodo function" },
          { type: "contains", target: "App.tsx", value: "deleteTodo", description: "Has deleteTodo function" },
        ],
        xpReward: 30,
      },
      {
        orderIndex: 4,
        title: "Local Storage Persistence",
        description: "Add persistence so todos survive page refresh.",
        instructions: `Implement local storage persistence:
1. Save todos to localStorage whenever they change
2. Load todos from localStorage on initial render
3. Use useEffect to handle the persistence logic

Create a custom hook called useTodoStorage that handles reading and writing to localStorage.`,
        requirements: [
          "Create useTodoStorage custom hook",
          "Load todos from localStorage on mount",
          "Save todos to localStorage when they change",
          "Handle JSON parsing errors gracefully",
        ],
        starterFiles: {
          "useTodoStorage.ts": `import { useState, useEffect } from 'react';
import { Todo } from './types';

const STORAGE_KEY = 'todos';

export function useTodoStorage(initialTodos: Todo[] = []) {
  // TODO: Implement localStorage persistence
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  // TODO: Load from localStorage on mount

  // TODO: Save to localStorage when todos change

  return [todos, setTodos] as const;
}`,
        },
        testCriteria: [
          { type: "contains", target: "useTodoStorage.ts", value: "localStorage", description: "Uses localStorage" },
          { type: "contains", target: "useTodoStorage.ts", value: "useEffect", description: "Uses useEffect for persistence" },
        ],
        xpReward: 25,
      },
      {
        orderIndex: 5,
        title: "Filtering and Polish",
        description: "Add filter functionality and final polish to the app.",
        instructions: `Add the finishing touches:
1. Create filter buttons (All, Active, Completed)
2. Display count of remaining todos
3. Add a "Clear Completed" button
4. Style the app with Tailwind CSS

Create a Filter component with buttons for each filter state.`,
        requirements: [
          "Add filter state (all, active, completed)",
          "Create Filter component with three buttons",
          "Display count of active todos",
          "Add Clear Completed functionality",
          "Apply final styling with Tailwind CSS",
        ],
        starterFiles: {
          "Filter.tsx": `import React from 'react';

type FilterType = 'all' | 'active' | 'completed';

interface FilterProps {
  current: FilterType;
  onChange: (filter: FilterType) => void;
  activeCount: number;
  onClearCompleted: () => void;
}

function Filter({ current, onChange, activeCount, onClearCompleted }: FilterProps) {
  // TODO: Implement filter UI
  return (
    <div className="flex justify-between items-center mt-4 p-4 bg-white rounded shadow">
      {/* TODO: Add filter buttons and clear completed */}
    </div>
  );
}

export default Filter;`,
        },
        testCriteria: [
          { type: "contains", target: "Filter.tsx", value: "all", description: "Has All filter" },
          { type: "contains", target: "Filter.tsx", value: "active", description: "Has Active filter" },
          { type: "contains", target: "Filter.tsx", value: "completed", description: "Has Completed filter" },
        ],
        xpReward: 35,
      },
    ],
  },

  // Weather Dashboard - Intermediate Project
  {
    slug: "weather-dashboard",
    title: "Weather Dashboard",
    description: "Build a weather dashboard that fetches real-time weather data from an API. Learn API integration, async/await, and data visualization.",
    difficulty: "intermediate",
    techStack: ["React", "TypeScript", "Tailwind CSS", "REST API", "Chart.js"],
    estimatedHours: 12,
    xpReward: 250,
    skills: ["API Integration", "Async/Await", "Error Handling", "Data Visualization", "Responsive Design"],
    milestones: [
      {
        orderIndex: 0,
        title: "Project Setup & API Key",
        description: "Set up the project and configure the weather API.",
        instructions: `Set up the weather dashboard:
1. Create the basic project structure
2. Set up environment variables for API key
3. Create TypeScript interfaces for weather data
4. Create a basic layout component

We'll use the OpenWeatherMap API (free tier).`,
        requirements: [
          "Create WeatherData TypeScript interface",
          "Set up environment variable for API key",
          "Create basic Layout component",
          "Create config file for API endpoints",
        ],
        starterFiles: {
          "types.ts": `// TODO: Define weather data interfaces

export interface WeatherData {
  // TODO: Define the structure based on OpenWeatherMap API response
}

export interface ForecastData {
  // TODO: Define forecast structure
}`,
          "config.ts": `// API Configuration
export const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherUrl = (city: string, apiKey: string) => {
  // TODO: Return the correct API URL
  return '';
};

export const getForecastUrl = (city: string, apiKey: string) => {
  // TODO: Return the forecast API URL
  return '';
};`,
        },
        testCriteria: [
          { type: "contains", target: "types.ts", value: "WeatherData", description: "WeatherData interface defined" },
          { type: "contains", target: "config.ts", value: "API_BASE_URL", description: "API URL configured" },
        ],
        xpReward: 25,
      },
      {
        orderIndex: 1,
        title: "Weather API Service",
        description: "Create a service to fetch weather data from the API.",
        instructions: `Create a weather API service:
1. Create async function to fetch current weather
2. Create async function to fetch 5-day forecast
3. Handle API errors gracefully
4. Add loading and error states

Use fetch() with async/await syntax.`,
        requirements: [
          "Create fetchWeather async function",
          "Create fetchForecast async function",
          "Handle network errors with try/catch",
          "Return typed data matching your interfaces",
        ],
        starterFiles: {
          "weatherService.ts": `import { WeatherData, ForecastData } from './types';
import { getWeatherUrl, getForecastUrl } from './config';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || '';

export async function fetchWeather(city: string): Promise<WeatherData> {
  // TODO: Implement API call
  throw new Error('Not implemented');
}

export async function fetchForecast(city: string): Promise<ForecastData> {
  // TODO: Implement API call
  throw new Error('Not implemented');
}`,
        },
        testCriteria: [
          { type: "contains", target: "weatherService.ts", value: "async", description: "Uses async functions" },
          { type: "contains", target: "weatherService.ts", value: "fetch", description: "Uses fetch API" },
          { type: "contains", target: "weatherService.ts", value: "try", description: "Has error handling" },
        ],
        xpReward: 35,
      },
      {
        orderIndex: 2,
        title: "Search Component",
        description: "Create a search component for entering city names.",
        instructions: `Create a SearchBar component:
1. Input field for city name
2. Search button
3. Loading state indicator
4. Recent searches list (store in localStorage)

Handle form submission and pass the city to parent component.`,
        requirements: [
          "Create SearchBar component with input and button",
          "Manage input state with useState",
          "Display loading indicator during search",
          "Store recent searches in localStorage",
        ],
        starterFiles: {
          "SearchBar.tsx": `import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // TODO: Load recent searches from localStorage

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search logic
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* TODO: Add search input and button */}
    </form>
  );
}

export default SearchBar;`,
        },
        testCriteria: [
          { type: "contains", target: "SearchBar.tsx", value: "onSearch", description: "Has onSearch callback" },
          { type: "contains", target: "SearchBar.tsx", value: "localStorage", description: "Uses localStorage for recent searches" },
        ],
        xpReward: 30,
      },
      {
        orderIndex: 3,
        title: "Current Weather Display",
        description: "Create a component to display current weather conditions.",
        instructions: `Create a WeatherCard component:
1. Display city name and country
2. Show temperature (with unit toggle C/F)
3. Display weather icon and description
4. Show additional details (humidity, wind, feels like)

Use conditional rendering for loading and error states.`,
        requirements: [
          "Display current temperature with unit",
          "Show weather icon from API",
          "Display humidity and wind speed",
          "Add temperature unit toggle (C/F)",
        ],
        starterFiles: {
          "WeatherCard.tsx": `import React, { useState } from 'react';
import { WeatherData } from './types';

interface WeatherCardProps {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

function WeatherCard({ weather, isLoading, error }: WeatherCardProps) {
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  // TODO: Helper function to convert temperature
  const formatTemp = (temp: number) => {
    // TODO: Implement conversion
    return temp;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!weather) {
    return <div>Search for a city to see weather</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* TODO: Display weather information */}
    </div>
  );
}

export default WeatherCard;`,
        },
        testCriteria: [
          { type: "contains", target: "WeatherCard.tsx", value: "temperature", description: "Displays temperature" },
          { type: "contains", target: "WeatherCard.tsx", value: "unit", description: "Has unit toggle" },
        ],
        xpReward: 35,
      },
      {
        orderIndex: 4,
        title: "5-Day Forecast",
        description: "Create a component to display the 5-day weather forecast.",
        instructions: `Create a Forecast component:
1. Display 5-day forecast in a horizontal scroll or grid
2. Show date, weather icon, and high/low temps for each day
3. Group API data by day (API returns 3-hour intervals)
4. Use consistent styling with WeatherCard`,
        requirements: [
          "Display 5-day forecast",
          "Group forecast data by day",
          "Show high and low temperatures",
          "Display weather icons for each day",
        ],
        starterFiles: {
          "Forecast.tsx": `import React from 'react';
import { ForecastData } from './types';

interface ForecastProps {
  forecast: ForecastData | null;
  isLoading: boolean;
}

// Helper to group forecast by day
function groupByDay(forecastList: any[]) {
  // TODO: Group 3-hour intervals into days
  return [];
}

function Forecast({ forecast, isLoading }: ForecastProps) {
  if (isLoading) {
    return <div>Loading forecast...</div>;
  }

  if (!forecast) {
    return null;
  }

  const dailyForecasts = groupByDay(forecast.list || []);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">5-Day Forecast</h2>
      <div className="grid grid-cols-5 gap-4">
        {/* TODO: Render forecast cards */}
      </div>
    </div>
  );
}

export default Forecast;`,
        },
        testCriteria: [
          { type: "contains", target: "Forecast.tsx", value: "groupByDay", description: "Groups data by day" },
          { type: "contains", target: "Forecast.tsx", value: "grid", description: "Uses grid layout" },
        ],
        xpReward: 40,
      },
      {
        orderIndex: 5,
        title: "Temperature Chart",
        description: "Add a chart showing temperature trends.",
        instructions: `Add data visualization:
1. Install and configure Chart.js
2. Create a line chart showing temperature over 5 days
3. Add toggle for showing feels-like temperature
4. Make the chart responsive

Use react-chartjs-2 for React integration.`,
        requirements: [
          "Install and configure Chart.js",
          "Create temperature trend line chart",
          "Add chart legend and labels",
          "Make chart responsive on mobile",
        ],
        starterFiles: {
          "TemperatureChart.tsx": `import React from 'react';
// TODO: Import Chart.js components

interface ChartData {
  labels: string[];
  temperatures: number[];
  feelsLike: number[];
}

interface TemperatureChartProps {
  data: ChartData | null;
}

function TemperatureChart({ data }: TemperatureChartProps) {
  if (!data) {
    return null;
  }

  // TODO: Configure chart options

  // TODO: Prepare chart data

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">Temperature Trend</h2>
      {/* TODO: Render chart */}
    </div>
  );
}

export default TemperatureChart;`,
        },
        testCriteria: [
          { type: "contains", target: "TemperatureChart.tsx", value: "Chart", description: "Uses Chart.js" },
        ],
        xpReward: 45,
      },
      {
        orderIndex: 6,
        title: "Final Integration & Polish",
        description: "Integrate all components and add final polish.",
        instructions: `Bring it all together:
1. Integrate all components in App
2. Add error boundaries
3. Add loading skeletons
4. Implement responsive design
5. Add geolocation for current location weather`,
        requirements: [
          "Integrate all components in App",
          "Add proper error handling UI",
          "Implement responsive design",
          "Add geolocation feature",
          "Polish UI with animations",
        ],
        starterFiles: {
          "App.tsx": `import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import WeatherCard from './WeatherCard';
import Forecast from './Forecast';
import TemperatureChart from './TemperatureChart';
import { fetchWeather, fetchForecast } from './weatherService';
import { WeatherData, ForecastData } from './types';

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Add geolocation on mount

  const handleSearch = async (city: string) => {
    // TODO: Implement search with loading states
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Weather Dashboard
        </h1>
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        <WeatherCard weather={weather} isLoading={isLoading} error={error} />
        <Forecast forecast={forecast} isLoading={isLoading} />
        {/* TODO: Add TemperatureChart */}
      </div>
    </div>
  );
}

export default App;`,
        },
        testCriteria: [
          { type: "contains", target: "App.tsx", value: "SearchBar", description: "Has SearchBar component" },
          { type: "contains", target: "App.tsx", value: "WeatherCard", description: "Has WeatherCard component" },
          { type: "contains", target: "App.tsx", value: "Forecast", description: "Has Forecast component" },
          { type: "contains", target: "App.tsx", value: "geolocation", description: "Has geolocation feature" },
        ],
        xpReward: 40,
      },
    ],
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.challengeSubmission.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.dailyHuntBug.deleteMany();
  await prisma.dailyHunt.deleteMany();
  await prisma.bugSubmission.deleteMany();
  await prisma.bug.deleteMany();
  await prisma.projectSubmission.deleteMany();
  await prisma.projectMilestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.learningSubmission.deleteMany();
  await prisma.userLearningProgress.deleteMany();
  await prisma.learningLesson.deleteMany();
  await prisma.learningPhase.deleteMany();
  await prisma.learningPath.deleteMany();

  // Create challenges
  console.log("\n📚 Creating challenges...");
  for (const challenge of challenges) {
    const created = await prisma.challenge.create({
      data: {
        slug: challenge.slug,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        category: challenge.category,
        tags: [challenge.category],
        xpReward: challenge.xpReward,
        constraints: challenge.constraints,
        examples: JSON.parse(JSON.stringify(challenge.examples)),
        hints: challenge.hints,
        architectInsight: challenge.architectInsight,
        starterCode: JSON.parse(JSON.stringify(challenge.starterCode)),
        solutions: JSON.parse(JSON.stringify(challenge.solutions)),
        testCases: JSON.parse(JSON.stringify(challenge.testCases)),
        isActive: true,
      },
    });

    console.log(`  ✓ Created challenge: ${created.title}`);
  }

  // Create bugs
  console.log("\n🐛 Creating bugs...");
  const createdBugs: string[] = [];
  for (const bug of bugs) {
    const created = await prisma.bug.create({
      data: {
        slug: bug.slug,
        title: bug.title,
        description: bug.description,
        difficulty: bug.difficulty,
        type: bug.type,
        language: bug.language,
        buggyCode: bug.buggyCode,
        correctCode: bug.correctCode,
        hint: bug.hint,
        explanation: bug.explanation,
        xpReward: bug.xpReward,
        testCases: JSON.parse(JSON.stringify(bug.testCases)),
        isActive: true,
      },
    });

    createdBugs.push(created.id);
    console.log(`  ✓ Created bug: ${created.title} (${created.type}, ${created.difficulty})`);
  }

  // Create today's Daily Hunt with 3 bugs (1 easy, 1 medium, 1 hard)
  console.log("\n🎯 Creating daily hunt...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Select bugs for daily hunt - pick by difficulty
  const easyBugs = bugs.filter(b => b.difficulty === "easy");
  const mediumBugs = bugs.filter(b => b.difficulty === "medium");
  // hardBugs aren't directly used, but we calculate hardBugIds from the remainder

  // Get corresponding bug IDs
  const easyBugIds = createdBugs.slice(0, easyBugs.length);
  const mediumBugIds = createdBugs.slice(easyBugs.length, easyBugs.length + mediumBugs.length);
  const hardBugIds = createdBugs.slice(easyBugs.length + mediumBugs.length);

  // Pick one of each difficulty for today's hunt
  const dailyBugIds = [
    easyBugIds[0],   // First easy bug
    mediumBugIds[0], // First medium bug
    hardBugIds[0],   // First hard bug
  ];

  const dailyHunt = await prisma.dailyHunt.create({
    data: {
      date: today,
      bonusXp: 50,
      bugs: {
        create: dailyBugIds
          .filter((id): id is string => id !== undefined)
          .map((bugId, index) => ({
            bug: { connect: { id: bugId } },
            orderIndex: index,
          })),
      },
    },
    include: {
      bugs: {
        include: { bug: true },
      },
    },
  });

  console.log(`  ✓ Created daily hunt for ${today.toDateString()}`);
  console.log(`    Bugs included:`);
  for (const dailyBug of dailyHunt.bugs) {
    console.log(`    - ${dailyBug.bug.title} (${dailyBug.bug.difficulty})`);
  }

  // Create projects
  console.log("\n🏗️ Creating projects...");
  for (const project of projects) {
    const created = await prisma.project.create({
      data: {
        slug: project.slug,
        title: project.title,
        description: project.description,
        difficulty: project.difficulty,
        techStack: project.techStack,
        estimatedHours: project.estimatedHours,
        xpReward: project.xpReward,
        skills: project.skills,
        isActive: true,
        milestones: {
          create: project.milestones.map((milestone) => ({
            orderIndex: milestone.orderIndex,
            title: milestone.title,
            description: milestone.description,
            instructions: milestone.instructions,
            requirements: milestone.requirements,
            starterFiles: JSON.parse(JSON.stringify(milestone.starterFiles)),
            testCriteria: JSON.parse(JSON.stringify(milestone.testCriteria)),
            xpReward: milestone.xpReward,
          })),
        },
      },
      include: {
        milestones: true,
      },
    });

    console.log(`  ✓ Created project: ${created.title} (${created.difficulty})`);
    console.log(`    Milestones: ${created.milestones.length}`);
  }

  // Create learning paths
  console.log("\n🎓 Creating learning paths...");
  for (const path of learningPaths) {
    const created = await prisma.learningPath.create({
      data: {
        slug: path.slug,
        title: path.title,
        description: path.description,
        difficulty: path.difficulty,
        estimatedHours: path.estimatedHours,
        skills: path.skills,
        totalXp: path.totalXp,
        isActive: true,
        phases: {
          create: path.phases.map((phase) => ({
            orderIndex: phase.orderIndex,
            title: phase.title,
            description: phase.description,
            deliverable: phase.deliverable,
            xpReward: phase.xpReward,
            lessons: {
              create: phase.lessons.map((lesson) => ({
                orderIndex: lesson.orderIndex,
                title: lesson.title,
                type: lesson.type,
                content: lesson.content,
                xpReward: lesson.xpReward,
                exercise: lesson.exercise ? JSON.parse(JSON.stringify(lesson.exercise)) : null,
                quiz: lesson.quiz ? JSON.parse(JSON.stringify(lesson.quiz)) : null,
              })),
            },
          })),
        },
      },
      include: {
        phases: {
          include: {
            lessons: true,
          },
        },
      },
    });

    const totalLessons = created.phases.reduce((sum, p) => sum + p.lessons.length, 0);
    console.log(`  ✓ Created learning path: ${created.title} (${created.difficulty})`);
    console.log(`    Phases: ${created.phases.length}, Lessons: ${totalLessons}`);
  }

  console.log(`\n✅ Seed completed!`);
  console.log(`   📚 Created ${challenges.length} challenges`);
  console.log(`   🐛 Created ${bugs.length} bugs`);
  console.log(`   🎯 Created 1 daily hunt with ${dailyHunt.bugs.length} bugs`);
  console.log(`   🏗️ Created ${projects.length} projects`);
  console.log(`   🎓 Created ${learningPaths.length} learning paths`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

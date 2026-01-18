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
  isHidden: boolean;
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

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing challenges and submissions
  console.log("Clearing existing data...");
  await prisma.challengeSubmission.deleteMany();
  await prisma.challenge.deleteMany();

  // Create challenges
  console.log("Creating challenges...");
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

    console.log(`  ✓ Created: ${created.title}`);
  }

  console.log(`\n✅ Seed completed! Created ${challenges.length} challenges.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

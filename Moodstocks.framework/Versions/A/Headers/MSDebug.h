//
//  Copyright (c) 2015 Moodstocks. All rights reserved.
//

#import <Foundation/Foundation.h>

#ifdef DEBUG
  #define MSDLog(...) NSLog(__VA_ARGS__)
#else
  #define MSDLog(...) ((void)0)
#endif

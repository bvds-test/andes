#!/usr/bin/perl
#
#   Modify log file to a canonical form for comparision via diff
#   Some of the canonicalizations are only needed for comparision with
#   logs generated by older versions of Andes.
#

while (<>) {   # loop over lines in all Andes sessions
    
    # canonicalize unbound variables that should have
    # been bound, fixed May 2007
    if(0 && m/^([\d:]+)\tDDE-COMMAND assoc \(GOAL /) {
	s/\(VARIABLE [^ ]+ /\(VARIABLE \*VAR\* /;
	s/\(FORCES ([^ ]+ [^ ]+) [^ )]+/\(FORCES $1 \*VAR\*/;
        s/\(TORQUES ([^ ]+ [^ ]+ [^ ]+) [^ )]+/\(TORQUES $1 \*VAR\*/;
        # hard to match this, so kill rest of line
	s/\(COMPO-EQN-SELECTED [^\r]+/\(COMPO-EQN-SELECTED \*REST\*))/;
	s/\(EQN [^ (]+ /\(EQN \*VAR\* /;
        s/\(VECTOR-DIAGRAM [^ ]+ /\(VECTOR-DIAGRAM \*VAR\* /;
    }

    # canonicalize randomized phrases.  This should be fixed
    # by explicit problem-specific seed to random-elt, March 2007.
    # Added use of random seed for flagging bad slot, August 1, 2007.
    if(1 && m/^([\d:]+)\tDDE-RESULT |!show-hint /) {
        # created by random-positive-feedback
	s/Good!|Right\.|Correct\.|Yes\.|Yep\.|That.s right\.|Very good\.|Right indeed\./\*YES\*/;
	# created by random-goal prefix
	s/Try |You should be |A good step would be |Your goal should be /\*TRY\* /;
    }

    #  Anders change to workbench API on July 17, 2007
    #  DDE-RESULT |NIL;VALUE -> DDE-RESULT |NIL
    if(m/^([\d:]+)\tDDE-RESULT /) {
	s/NIL;VALUE/NIL/; 
	s/\|NIL;[A-Z;\-]+\|/\|NIL\|/;
    }    

    # fix to print keywords properly in assoc entries, July 23, 2007
    # fix bug in remove-nil-keywords, August 13, 2007
    # remove nil keyword pairs
    if(m/^([\d:]+)\tDDE-COMMAND assoc /) {
	s/ :[A-Z]+ NIL//g;  
        s/ :/ /g;
        s/\|([^|]+)\|/\1/g;
        # hash function for derivatives changed, July 7, 2007
        s/( d[A-Z-]+)[_0-9]+dt/$1\*hash\*dt/g;
    }

    # bad hints fixed early August 2007.
    if(1 && m/^([\d:]+)\tDDE-RESULT |!show-hint /) {
        s/at T0 at T0/at T0/;
        s/(When the direction of a vector is not given or easily inferred from the problem statement, you should mark it unknown.) .*/$1/;
        s/(Double-click on the vector in order to bring up its properties) if necessary/$1/;
        s/Notice that at T[0-9], (.* is perpendicular to .* axis.)/Notice that $1/;
        s/(Because .* is perpendicular to .* axis) at T[0-9]/$1/;
        s/Since the .* (lies along the .* axis)/\*compo-parallel-axis-hint\* $1/;
        s/(due to the earth of type weight at T[0-9]) pointing straight down \(270 deg\)/$1/;
        s/ = /=/;  #F=m*g -> F = m*g
    }

    # result equations, fix up floating point issues
    if(1 && m/^([\d:]+)\tDDE-RESULT |.*=.*|/) {
        s/ = /=/;     #I don't know where this came from (August 13, 2007)
        s/([0-9]+\.[0-9]*)([0-8])9+ (?{$co=$2+1})/$1$co /; #round up trailing 9999's
        s/([0-9]+\.[0-9]{6})[0-9]+ /$1\*digits\* /; #take care of roundoff
    }

    print;
} #loop over lines in all sessions
